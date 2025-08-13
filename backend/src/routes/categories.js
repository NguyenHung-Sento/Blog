const express = require("express")
const { body } = require("express-validator")
const {
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController")
const { authenticateToken } = require("../middleware/auth")
const { isAdmin } = require("../middleware/admin")

const router = express.Router()

// Public routes
router.get("/", getAllCategories)
router.get("/slug/:slug", getCategoryBySlug)

// Admin routes
router.get("/:id", authenticateToken, isAdmin, getCategoryById)

router.post(
  "/",
  authenticateToken,
  isAdmin,
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
    body("description").optional().isLength({ max: 500 }).withMessage("Description must not exceed 500 characters"),
    body("color")
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage("Color must be a valid hex color"),
  ],
  createCategory,
)

router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
    body("description").optional().isLength({ max: 500 }).withMessage("Description must not exceed 500 characters"),
    body("color")
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage("Color must be a valid hex color"),
  ],
  updateCategory,
)

router.delete("/:id", authenticateToken, isAdmin, deleteCategory)

module.exports = router
