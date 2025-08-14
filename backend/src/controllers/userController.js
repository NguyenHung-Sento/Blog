const { User, Post, Follow, Like, Comment, Category } = require("../models")
const { Op } = require("sequelize")

// Get user profile by username (public)
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params

    const user = await User.findOne({
      where: { username, isActive: true },
      attributes: ["id", "username", "fullName", "avatar", "bio", "createdAt"],
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      })
    }

    // Get post count
    const postCount = await Post.count({
      where: { authorId: user.id, published: true },
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

// Get user posts by username (public but needs auth for like status)
const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 6
    const offset = (page - 1) * limit

    // First find the user
    const user = await User.findOne({
      where: { username, isActive: true },
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
      where: { authorId: user.id, published: true },
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

module.exports = {
  getUserByUsername,
  getUserPosts,
}
