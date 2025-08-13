const { User, Post, Like } = require("../models")

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params

    const user = await User.findOne({
      where: { username, isActive: true },
      attributes: { exclude: ["password", "email"] },
      include: [
        {
          model: Post,
          as: "posts",
          where: { published: true },
          attributes: ["id"],
          required: false,
        },
      ],
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const postCount = user.posts ? user.posts.length : 0

    res.json({
      user: {
        ...user.toJSON(),
        postCount,
        posts: undefined, // Remove posts array from response
      },
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const user = await User.findOne({
      where: { username, isActive: true },
      attributes: ["id"],
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: { authorId: user.id, published: true },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "fullName", "avatar"],
        },
        {
          model: Like,
          as: "likes",
          attributes: ["userId"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    })

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalPosts: count,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get user posts error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getUserProfile,
  getUserPosts,
}
