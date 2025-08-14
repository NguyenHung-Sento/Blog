const express = require("express")
const router = express.Router()
const { getUserByUsername, getUserPosts } = require("../controllers/userController")
const { authenticateToken } = require("../middleware/auth")

// Public routes - get user info by username
router.get("/:username", getUserByUsername)
router.get("/:username/posts", authenticateToken, getUserPosts)

module.exports = router
