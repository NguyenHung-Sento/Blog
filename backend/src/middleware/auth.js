const jwt = require("jsonwebtoken")
const { User } = require("../models")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token is required" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid token or user not found" })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired" })
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid access token" })
    }

    console.error("Auth middleware error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ["password"] },
      })

      if (user && user.isActive) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // For optional auth, we don't return error, just continue without user
    next()
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
}
