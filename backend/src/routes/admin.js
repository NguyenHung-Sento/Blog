const express = require("express")
const { authenticateToken } = require("../middleware/auth")
const { isAdmin } = require("../middleware/admin")
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllPostsAdmin,
  updatePostStatus,
  deletePostAdmin,
  getDashboardStats,
} = require("../controllers/adminController")

const router = express.Router()

// Apply admin middleware to all routes
router.use(authenticateToken, isAdmin)

// Dashboard
router.get("/dashboard", getDashboardStats)

// User Management
router.get("/users", getAllUsers)
router.get("/users/:id", getUserById)
router.patch("/users/:id/status", updateUserStatus)
router.patch("/users/:id/role", updateUserRole)
router.delete("/users/:id", deleteUser)

// Post Management
router.get("/posts", getAllPostsAdmin)
router.patch("/posts/:id/status", updatePostStatus)
router.delete("/posts/:id", deletePostAdmin)

module.exports = router
