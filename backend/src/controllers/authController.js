const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { validationResult } = require("express-validator")
const { User, PasswordReset } = require("../models")
const { sendPasswordResetEmail } = require("../services/emailService")
const fs = require("fs")
const path = require("path")

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
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

    // Generate token
    const token = generateToken(user.id)

    res.status(201).json({
      message: "User created successfully",
      token,
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

    // Generate token
    const token = generateToken(user.id)

    res.json({
      message: "Login successful",
      token,
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

    res.json({ message: "Password changed successfully" })
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

    res.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
}
