const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { validationResult } = require("express-validator")
const { User, PasswordReset, RefreshToken } = require("../models")
const { sendPasswordResetEmail } = require("../services/emailService")
const fs = require("fs")
const path = require("path")

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" })
}

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex")
}

const createRefreshToken = async (userId, deviceInfo = null) => {
  const token = generateRefreshToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  // Remove old refresh tokens for this user (optional: keep only latest 5)
  const existingTokens = await RefreshToken.findAll({
    where: { userId, isRevoked: false },
    order: [["createdAt", "DESC"]],
  })

  if (existingTokens.length >= 5) {
    // Keep only the 4 most recent tokens
    const tokensToRevoke = existingTokens.slice(4)
    await RefreshToken.update(
      { isRevoked: true },
      {
        where: {
          id: tokensToRevoke.map((t) => t.id),
        },
      },
    )
  }

  const refreshToken = await RefreshToken.create({
    token,
    userId,
    expiresAt,
    deviceInfo,
  })

  return refreshToken.token
}

const register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password, fullName } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require("sequelize").Op.or]: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ? "Email already exists" : "Username already exists",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
    })

    // Generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = await createRefreshToken(user.id, req.headers["user-agent"])

    res.status(201).json({
      message: "User created successfully",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ where: { email, isActive: true } })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = await createRefreshToken(user.id, req.headers["user-agent"])

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token is required" })
    }

    // Find refresh token
    const tokenRecord = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        isRevoked: false,
        expiresAt: {
          [require("sequelize").Op.gt]: new Date(),
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
      ],
    })

    if (!tokenRecord) {
      return res.status(401).json({ error: "Invalid or expired refresh token" })
    }

    // Generate new access token
    const accessToken = generateAccessToken(tokenRecord.userId)

    // Optionally generate new refresh token (rotate refresh tokens)
    const newRefreshToken = await createRefreshToken(tokenRecord.userId, req.headers["user-agent"])

    // Revoke old refresh token
    await RefreshToken.update({ isRevoked: true }, { where: { id: tokenRecord.id } })

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: tokenRecord.user,
    })
  } catch (error) {
    console.error("Refresh token error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      // Revoke refresh token
      await RefreshToken.update({ isRevoked: true }, { where: { token: refreshToken } })
    }

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id

    // Revoke all refresh tokens for this user
    await RefreshToken.update({ isRevoked: true }, { where: { userId } })

    res.json({ message: "Logged out from all devices successfully" })
  } catch (error) {
    console.error("Logout all error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    })

    res.json({ user })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { fullName, bio } = req.body
    const userId = req.user.id

    await User.update({ fullName, bio }, { where: { id: userId } })

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    })

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No avatar file uploaded" })
    }

    const userId = req.user.id
    const avatarUrl = `/uploads/avatars/${req.file.filename}`

    // Update user avatar in database
    await User.update({ avatar: avatarUrl }, { where: { id: userId } })

    // Get updated user data
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    })

    res.json({
      message: "Avatar updated successfully",
      user: user,
      url: avatarUrl,
    })
  } catch (error) {
    console.error("Upload avatar error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    // Get user with password
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await User.update({ password: hashedNewPassword }, { where: { id: userId } })

    // Revoke all refresh tokens (force re-login on all devices)
    await RefreshToken.update({ isRevoked: true }, { where: { userId } })

    res.json({ message: "Password changed successfully. Please login again on all devices." })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email } = req.body

    // Check if user exists
    const user = await User.findOne({ where: { email, isActive: true } })
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: "If the email exists, a reset link has been sent" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save reset token
    await PasswordReset.create({
      email,
      token: resetToken,
      expiresAt,
    })

    // Send email
    const emailSent = await sendPasswordResetEmail(email, resetToken)
    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send reset email" })
    }

    res.json({ message: "If the email exists, a reset link has been sent" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { token, password } = req.body

    // Find reset token
    const resetRecord = await PasswordReset.findOne({
      where: {
        token,
        used: false,
        expiresAt: {
          [require("sequelize").Op.gt]: new Date(),
        },
      },
    })

    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or expired reset token" })
    }

    // Find user
    const user = await User.findOne({ where: { email: resetRecord.email } })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password
    await User.update({ password: hashedPassword }, { where: { id: user.id } })

    // Mark token as used
    await PasswordReset.update({ used: true }, { where: { id: resetRecord.id } })

    // Revoke all refresh tokens for this user
    await RefreshToken.update({ isRevoked: true }, { where: { userId: user.id } })

    res.json({ message: "Password reset successfully. Please login again." })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
}
