const express = require("express")
const { body } = require("express-validator")
const { register, login, getProfile, updateProfile, updateAvatar } = require("../controllers/authController")
const { uploadAvatar } = require("../middleware/upload")
const {authenticateToken} = require("../middleware/auth")

const router = express.Router()

// Validation rules
const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .isAlphanumeric()
    .withMessage("Username must contain only letters and numbers"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("fullName").isLength({ min: 2, max: 100 }).withMessage("Full name must be between 2 and 100 characters"),
]

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
]

const updateProfileValidation = [
  body("fullName").isLength({ min: 2, max: 100 }).withMessage("Full name must be between 2 and 100 characters"),
  body("bio").optional().isLength({ max: 500 }).withMessage("Bio must not exceed 500 characters"),
]

// Routes
router.post("/register", registerValidation, register)
router.post("/login", loginValidation, login)
router.get("/profile", authenticateToken, getProfile)
router.put("/profile", authenticateToken, updateProfileValidation, updateProfile)
router.put("/avatar", authenticateToken, uploadAvatar, updateAvatar)

module.exports = router
