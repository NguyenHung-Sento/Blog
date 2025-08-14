const { validationResult } = require("express-validator")
const { Post, User, Like, Comment, Category, Follow } = require("../models")
const { Op } = require("sequelize")

const createSlug = (title) => {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-") +
    "-" +
    Date.now()
  )
}

const getAllPosts = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const search = req.query.search || ""
    const categoryId = req.query.category || ""
    const sort = req.query.sort || "newest"

    const whereClause = {
      published: true,
      ...(search && {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } },
          { excerpt: { [Op.like]: `%${search}%` } },
        ],
      }),
      ...(categoryId && { categoryId: Number.parseInt(categoryId) }),
    }

    let orderClause
    if (sort === "popular") {
      // Sắp xếp theo số lượng like và view
      orderClause = [
        [{ model: Like, as: "likes" }, "id", "DESC"],
        ["viewCount", "DESC"],
        ["createdAt", "DESC"],
      ]
    } else {
      // Mặc định sắp xếp theo mới nhất
      orderClause = [["createdAt", "DESC"]]
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
      order: orderClause,
      limit,
      offset,
      distinct: true,
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
    console.error("Get posts error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user.id
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const sort = req.query.sort || "newest"

    // Lấy danh sách người dùng đang theo dõi
    const following = await Follow.findAll({
      where: { followerId: userId },
      attributes: ["followingId"],
    })

    const followingIds = following.map((f) => f.followingId)

    if (followingIds.length === 0) {
      return res.json({
        posts: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalPosts: 0,
          hasNext: false,
          hasPrev: false,
        },
      })
    }

    let orderClause
    if (sort === "popular") {
      orderClause = [
        [{ model: Like, as: "likes" }, "id", "DESC"],
        ["viewCount", "DESC"],
        ["createdAt", "DESC"],
      ]
    } else {
      orderClause = [["createdAt", "DESC"]]
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: {
        published: true,
        authorId: { [Op.in]: followingIds },
      },
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
      order: orderClause,
      limit,
      offset,
      distinct: true,
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
    console.error("Get following posts error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getRelatedPosts = async (req, res) => {
  try {
    const { id } = req.params
    const limit = Number.parseInt(req.query.limit) || 5

    const currentPost = await Post.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id"],
        },
      ],
    })

    if (!currentPost) {
      return res.status(404).json({ error: "Post not found" })
    }

    const whereClause = {
      published: true,
      id: { [Op.ne]: id }, // Loại trừ bài viết hiện tại
    }

    // Ưu tiên bài viết cùng category
    if (currentPost.categoryId) {
      whereClause.categoryId = currentPost.categoryId
    }

    let posts = await Post.findAll({
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
      ],
      order: [["createdAt", "DESC"]],
      limit,
    })

    // Nếu không đủ bài viết cùng category, lấy thêm bài viết khác
    if (posts.length < limit) {
      const remainingLimit = limit - posts.length
      const additionalPosts = await Post.findAll({
        where: {
          published: true,
          id: {
            [Op.notIn]: [id, ...posts.map((p) => p.id)],
          },
        },
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
        ],
        order: [
          ["viewCount", "DESC"],
          ["createdAt", "DESC"],
        ],
        limit: remainingLimit,
      })

      posts = [...posts, ...additionalPosts]
    }

    res.json({ posts })
  } catch (error) {
    console.error("Get related posts error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const post = await Post.findOne({
      where: { slug, published: true },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "fullName", "avatar", "bio"],
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
      ],
    })

    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    // Increment view count
    await post.increment("viewCount")

    res.json({ post })
  } catch (error) {
    console.error("Get post error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const createPost = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, content, excerpt, published = false, categoryId, featuredImage } = req.body
    const authorId = req.user.id

    const slug = createSlug(title)

    const post = await Post.create({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + "...",
      slug,
      published,
      publishedAt: published ? new Date() : null,
      authorId,
      categoryId: categoryId || null,
      featuredImage: featuredImage || null,
    })

    const postWithDetails = await Post.findByPk(post.id, {
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
    })

    res.status(201).json({
      message: "Post created successfully",
      post: postWithDetails,
    })
  } catch (error) {
    console.error("Create post error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const updatePost = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { title, content, excerpt, published, categoryId, featuredImage } = req.body
    const userId = req.user.id

    const post = await Post.findOne({
      where: { id, authorId: userId },
    })

    if (!post) {
      return res.status(404).json({ error: "Post not found or unauthorized" })
    }

    const updateData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + "...",
      categoryId: categoryId || null,
      featuredImage: featuredImage !== undefined ? featuredImage : post.featuredImage,
    }

    if (published !== undefined) {
      updateData.published = published
      if (published && !post.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    if (title !== post.title) {
      updateData.slug = createSlug(title)
    }

    await post.update(updateData)

    const updatedPost = await Post.findByPk(id, {
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
    })

    res.json({
      message: "Post updated successfully",
      post: updatedPost,
    })
  } catch (error) {
    console.error("Update post error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const deletePost = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const post = await Post.findOne({
      where: { id, authorId: userId },
    })

    if (!post) {
      return res.status(404).json({ error: "Post not found or unauthorized" })
    }

    await post.destroy()

    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Delete post error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const post = await Post.findByPk(id)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    const existingLike = await Like.findOne({
      where: { postId: id, userId },
    })

    if (existingLike) {
      await existingLike.destroy()
      res.json({ liked: false, message: "Post unliked" })
    } else {
      await Like.create({ postId: id, userId })
      res.json({ liked: true, message: "Post liked" })
    }
  } catch (error) {
    console.error("Toggle like error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const { count, rows: posts } = await Post.findAndCountAll({
      where: { authorId: userId },
      include: [
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
    console.error("Get user posts error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getAllPosts,
  getFollowingPosts,
  getRelatedPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getUserPosts,
}
