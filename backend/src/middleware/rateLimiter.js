const rateLimit = require("express-rate-limit")

// Rate limiter cho follow actions
const followLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: "Too many follow/unfollow requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter cho general API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  followLimiter,
  generalLimiter,
}
