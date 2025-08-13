const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const {authenticateToken} = require("../middleware/auth")
const {uploadAvatar} = require("../middleware/upload")

// Public routes
router.get("/:username", userController.getUserByUsername)
router.get("/:username/posts", userController.getUserPosts)

// Protected routes
router.get("/me/profile", authenticateToken, userController.getCurrentUser)
router.put("/me/profile", authenticateToken, userController.updateProfile)
router.put("/me/avatar", authenticateToken, authenticateToken, userController.updateAvatar)

module.exports = router
