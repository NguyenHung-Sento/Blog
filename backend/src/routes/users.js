const express = require("express")
const { getUserProfile, getUserPosts } = require("../controllers/userController")
const { optionalAuth } = require("../middleware/auth")

const router = express.Router()

// Routes
router.get("/:username", optionalAuth, getUserProfile)
router.get("/:username/posts", optionalAuth, getUserPosts)

module.exports = router
