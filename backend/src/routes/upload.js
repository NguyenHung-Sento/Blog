const express = require("express")
const { uploadImage, uploadFeaturedImage, deleteImage } = require("../controllers/uploadController")
const {
  uploadImage: uploadImageMiddleware,
  uploadFeaturedImage: uploadFeaturedImageMiddleware,
} = require("../middleware/upload")
const {authenticateToken} = require("../middleware/auth")

const router = express.Router()

// Upload routes
router.post("/image", authenticateToken, uploadImageMiddleware, uploadImage)
router.post("/featured-image", authenticateToken, uploadFeaturedImageMiddleware, uploadFeaturedImage)
router.delete("/:filename", authenticateToken, deleteImage)

module.exports = router
