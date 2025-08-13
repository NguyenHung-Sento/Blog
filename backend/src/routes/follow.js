const express = require("express")
const { authenticateToken } = require("../middleware/auth")
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
} = require("../controllers/followController")

const router = express.Router()

// Follow/unfollow user
router.post("/:userId", authenticateToken, followUser)
router.delete("/:userId", authenticateToken, unfollowUser)

// Get followers/following
router.get("/:userId/followers", getFollowers)
router.get("/:userId/following", getFollowing)

// Check follow status
router.get("/:userId/status", authenticateToken, checkFollowStatus)

module.exports = router
