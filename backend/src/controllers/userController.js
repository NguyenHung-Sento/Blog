const User = require("../models/User")
const Post = require("../models/Post")
const Follow = require("../models/Follow")
const Like = require("../models/Like")
const Comment = require("../models/Comment")
const Category = require("../models/Category")
const { Op } = require("sequelize")

// Get user profile by username
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params

    const user = await User.findOne({
      where: { username },
      attributes: ["id", "username", "fullName", "avatar", "bio", "createdAt"],
      include: [
        {
          model: Post,
          as: "posts",
          attributes: ["id"],
        },
      ],
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      })
    }

    // Get post count
    const postCount = await Post.count({
      where: { authorId: user.id },
    })

    // Get follow stats
    const [followersCount, followingCount] = await Promise.all([
      Follow.count({ where: { followingId: user.id } }),
      Follow.count({ where: { followerId: user.id } }),
    ])

    const userProfile = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      bio: user.bio,
      postCount,
      createdAt: user.createdAt,
      followStats: {
        followers: followersCount,
        following: followingCount,
      },
    }

    res.json({
      success: true,
      data: userProfile,
    })
  } catch (error) {
    console.error("Get user by username error:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    })
  }
}

// Get user posts by username
const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 6
    const offset = (page - 1) * limit

    // First find the user
    const user = await User.findOne({
      where: { username },
      attributes: ["id"],
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      })
    }

    // Get posts with pagination
    const { count, rows: posts } = await Post.findAndCountAll({
      where: { authorId: user.id },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "fullName", "avatar"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug", "color"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    })

    // Add likes and comments count for each post
    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const [likesCount, commentsCount] = await Promise.all([
          Like.count({ where: { postId: post.id } }),
          Comment.count({ where: { postId: post.id } }),
        ])

        // Get user's like status if authenticated
        let userLiked = false
        if (req.user) {
          const userLike = await Like.findOne({
            where: { postId: post.id, userId: req.user.id },
          })
          userLiked = !!userLike
        }

        return {
          ...post.toJSON(),
          likes: Array(likesCount)
            .fill(null)
            .map((_, index) => ({ userId: index + 1 })),
          userLiked,
          commentsCount,
        }
      }),
    )

    const totalPages = Math.ceil(count / limit)

    res.json({
      success: true,
      data: {
        posts: postsWithStats,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("Get user posts error:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    })
  }
}

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "fullName", "email", "avatar", "bio", "role", "createdAt"],
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    })
  }
}

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio } = req.body
    const userId = req.user.id

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      })
    }

    // Update user data
    const updateData = {}
    if (fullName !== undefined) updateData.fullName = fullName
    if (bio !== undefined) updateData.bio = bio

    await user.update(updateData)

    // Return updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: ["id", "username", "fullName", "email", "avatar", "bio", "role", "createdAt"],
    })

    res.json({
      success: true,
      data: updatedUser,
      message: "Cập nhật thông tin thành công",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    })
  }
}

// Update avatar
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ảnh",
      })
    }

    const userId = req.user.id
    const avatarPath = `/uploads/avatars/${req.file.filename}`

    await User.update({ avatar: avatarPath }, { where: { id: userId } })

    res.json({
      success: true,
      data: { avatar: avatarPath },
      message: "Cập nhật ảnh đại diện thành công",
    })
  } catch (error) {
    console.error("Update avatar error:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    })
  }
}

module.exports = {
  getCurrentUser,
  updateProfile,
  updateAvatar,
  getUserByUsername,
  getUserPosts,
}
