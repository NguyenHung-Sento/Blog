const { User, Post, Comment, Like, Category } = require("../models")
const { Op } = require("sequelize")
const bcrypt = require("bcryptjs")

// User Management
const getAllUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const search = req.query.search || ""
    const roleFilter = req.query.role || ""
    const statusFilter = req.query.status || ""

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { fullName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      }),
      ...(roleFilter && { role: roleFilter }),
      ...(statusFilter === "active" && { isActive: true }),
      ...(statusFilter === "inactive" && { isActive: false }),
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Post,
          as: "posts",
          attributes: ["id"],
          required: false,
        },
        {
          model: Comment,
          as: "comments",
          attributes: ["id"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    })

    const usersWithCounts = users.map((user) => ({
      ...user.toJSON(),
      postCount: user.posts ? user.posts.length : 0,
      commentCount: user.comments ? user.comments.length : 0,
      posts: undefined,
      comments: undefined,
    }))

    res.json({
      users: usersWithCounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Post,
          as: "posts",
          attributes: ["id", "title", "published", "createdAt"],
          limit: 5,
          order: [["createdAt", "DESC"]],
        },
        {
          model: Comment,
          as: "comments",
          attributes: ["id", "content", "createdAt"],
          limit: 5,
          order: [["createdAt", "DESC"]],
        },
      ],
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    await user.update({ isActive })

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        id: user.id,
        username: user.username,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" })
    }

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    await user.update({ role })

    res.json({
      message: "User role updated successfully",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Update user role error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if user has posts or comments
    const postCount = await Post.count({ where: { authorId: id } })
    const commentCount = await Comment.count({ where: { authorId: id } })

    if (postCount > 0 || commentCount > 0) {
      return res.status(400).json({
        error: "Cannot delete user with existing posts or comments. Please transfer or delete content first.",
      })
    }

    await user.destroy()

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Post Management
const getAllPostsAdmin = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const search = req.query.search || ""
    const statusFilter = req.query.status || ""
    const categoryFilter = req.query.category || ""

    const whereClause = {
      ...(search && {
        [Op.or]: [{ title: { [Op.like]: `%${search}%` } }, { content: { [Op.like]: `%${search}%` } }],
      }),
      ...(statusFilter === "published" && { published: true }),
      ...(statusFilter === "draft" && { published: false }),
      ...(categoryFilter && { categoryId: Number.parseInt(categoryFilter) }),
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
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
        {
          model: Like,
          as: "likes",
          attributes: ["userId"],
        },
        {
          model: Comment,
          as: "comments",
          attributes: ["id"],
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
    console.error("Get posts admin error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { published } = req.body

    const post = await Post.findByPk(id)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    const updateData = { published }
    if (published && !post.publishedAt) {
      updateData.publishedAt = new Date()
    }

    await post.update(updateData)

    res.json({
      message: `Post ${published ? "published" : "unpublished"} successfully`,
      post: {
        id: post.id,
        title: post.title,
        published: post.published,
        publishedAt: post.publishedAt,
      },
    })
  } catch (error) {
    console.error("Update post status error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const deletePostAdmin = async (req, res) => {
  try {
    const { id } = req.params

    const post = await Post.findByPk(id)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    await post.destroy()

    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Delete post admin error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count()
    const totalPosts = await Post.count()
    const totalCategories = await Category.count()
    const totalComments = await Comment.count()

    const publishedPosts = await Post.count({ where: { published: true } })
    const draftPosts = await Post.count({ where: { published: false } })

    const activeUsers = await User.count({ where: { isActive: true } })
    const inactiveUsers = await User.count({ where: { isActive: false } })

    // Recent posts
    const recentPosts = await Post.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
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
        {
          model: Comment,
          as: "comments",
          attributes: ["id"],
        },
      ],
    })

    // Recent users
    const recentUsers = await User.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] },
    })

    // Total views and likes
    const posts = await Post.findAll({
      attributes: ["viewCount"],
      include: [
        {
          model: Like,
          as: "likes",
          attributes: ["id"],
        },
      ],
    })

    const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0)
    const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0)

    res.json({
      stats: {
        totalUsers,
        totalPosts,
        totalCategories,
        totalComments,
        totalViews,
        totalLikes,
        publishedPosts,
        draftPosts,
        activeUsers,
        inactiveUsers,
      },
      recentPosts,
      recentUsers,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllPostsAdmin,
  updatePostStatus,
  deletePostAdmin,
  getDashboardStats,
}
