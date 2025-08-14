const { Follow, User } = require("../models")

const followUser = async (req, res) => {
  try {
    const { userId } = req.params
    const followerId = req.user.id

    if (followerId === Number.parseInt(userId)) {
      return res.status(400).json({ error: "Cannot follow yourself" })
    }

    // Check if user exists
    const userToFollow = await User.findByPk(userId)
    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: { followerId, followingId: userId },
    })

    if (existingFollow) {
      return res.status(400).json({ error: "Already following this user" })
    }

    await Follow.create({
      followerId,
      followingId: userId,
    })

    res.json({ message: "User followed successfully", following: true })
  } catch (error) {
    console.error("Follow user error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params
    const followerId = req.user.id

    const follow = await Follow.findOne({
      where: { followerId, followingId: userId },
    })

    if (!follow) {
      return res.status(404).json({ error: "Not following this user" })
    }

    await follow.destroy()

    res.json({ message: "User unfollowed successfully", following: false })
  } catch (error) {
    console.error("Unfollow user error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const { count, rows: followers } = await Follow.findAndCountAll({
      where: { followingId: userId },
      include: [
        {
          model: User,
          as: "follower",
          attributes: ["id", "username", "fullName", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    })

    res.json({
      followers: followers.map((f) => f.follower),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalFollowers: count,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get followers error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const { count, rows: following } = await Follow.findAndCountAll({
      where: { followerId: userId },
      include: [
        {
          model: User,
          as: "following",
          attributes: ["id", "username", "fullName", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    })

    res.json({
      following: following.map((f) => f.following),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalFollowing: count,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get following error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params
    const followerId = req.user.id

    if (!followerId) {
      return res.json({ following: false })
    }

    const follow = await Follow.findOne({
      where: { followerId, followingId: userId },
    })

    res.json({ following: !!follow })
  } catch (error) {
    console.error("Check follow status error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
}
