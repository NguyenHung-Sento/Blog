const express = require("express")
const { body } = require("express-validator")
const { authenticateToken, optionalAuth } = require("../middleware/auth")
const {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getUserPosts,
} = require("../controllers/postController")

const router = express.Router()

// Validation rules
const postValidation = [
  body("title").isLength({ min: 5, max: 255 }).withMessage("Title must be between 5 and 255 characters"),
  body("content").isLength({ min: 10, max: 50000 }).withMessage("Content must be between 10 and 50000 characters"),
  body("excerpt").optional().isLength({ max: 500 }).withMessage("Excerpt must not exceed 500 characters"),
  body("published").optional().isBoolean().withMessage("Published must be a boolean value"),
]

// Routes
router.get("/", optionalAuth, getAllPosts)
router.get("/my-posts", authenticateToken, getUserPosts)
router.get("/:slug", optionalAuth, getPostBySlug)
router.post("/", authenticateToken, postValidation, createPost)
router.put("/:id", authenticateToken, postValidation, updatePost)
router.delete("/:id", authenticateToken, deletePost)
router.post("/:id/like", authenticateToken, toggleLike)

module.exports = router
