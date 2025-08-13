const path = require("path")
const fs = require("fs")

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" })
    }

    const imageUrl = `/uploads/images/${req.file.filename}`

    res.json({
      message: "Image uploaded successfully",
      url: imageUrl,
      filename: req.file.filename,
      fullUrl: `${req.protocol}://${req.get("host")}${imageUrl}`,
    })
  } catch (error) {
    console.error("Upload image error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const uploadFeaturedImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No featured image file uploaded" })
    }

    const imageUrl = `/uploads/featured-images/${req.file.filename}`

    res.json({
      message: "Featured image uploaded successfully",
      url: imageUrl,
      filename: req.file.filename,
      fullUrl: `${req.protocol}://${req.get("host")}${imageUrl}`,
    })
  } catch (error) {
    console.error("Upload featured image error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params

    // Check multiple possible paths
    const possiblePaths = [
      path.join(__dirname, "../../uploads/images", filename),
      path.join(__dirname, "../../uploads/avatars", filename),
      path.join(__dirname, "../../uploads/featured-images", filename),
    ]

    let deleted = false
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        deleted = true
        break
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: "File not found" })
    }

    res.json({ message: "Image deleted successfully" })
  } catch (error) {
    console.error("Delete image error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  uploadImage,
  uploadFeaturedImage,
  deleteImage,
}
