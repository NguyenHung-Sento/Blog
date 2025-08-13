const express = require("express")
const { body } = require("express-validator")
const { authenticateToken, optionalAuth } = require("../middleware/auth")
const { getCommentsByPost, createComment, updateComment, deleteComment } = require("../controllers/commentController")

const router = express.Router()

// Validation rules
const commentValidation = [
  body("content").isLength({ min: 1, max: 1000 }).withMessage("Comment must be between 1 and 1000 characters"),
]

// Routes
router.get("/post/:postId", optionalAuth, getCommentsByPost)
router.post("/", authenticateToken, commentValidation, createComment)
router.put("/:id", authenticateToken, commentValidation, updateComment)
router.delete("/:id", authenticateToken, deleteComment)

module.exports = router
