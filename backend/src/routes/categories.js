const express = require("express")
const { body } = require("express-validator")
const { authenticateToken } = require("../middleware/auth")
const { isAdmin } = require("../middleware/admin")
const {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController")

const router = express.Router()

// Validation rules
const categoryValidation = [
  body("name").isLength({ min: 2, max: 100 }).withMessage("Category name must be between 2 and 100 characters"),
  body("description").optional().isLength({ max: 500 }).withMessage("Description must not exceed 500 characters"),
  body("color")
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage("Color must be a valid hex color"),
]

// Routes
router.get("/", getAllCategories)
router.get("/:slug", getCategoryBySlug)
router.post("/", authenticateToken, isAdmin, categoryValidation, createCategory)
router.put("/:id", authenticateToken, isAdmin, categoryValidation, updateCategory)
router.delete("/:id", authenticateToken, isAdmin, deleteCategory)

module.exports = router
