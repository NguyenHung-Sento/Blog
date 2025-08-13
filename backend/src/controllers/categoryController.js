const { validationResult } = require("express-validator")
const { Category, Post, User, Like, Comment } = require("../models")
const { Op } = require("sequelize")

const createSlug = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-")
}

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Post,
          as: "posts",
          where: { published: true },
          attributes: ["id"],
          required: false,
        },
      ],
      order: [["name", "ASC"]],
    })

    const categoriesWithCount = categories.map((category) => ({
      ...category.toJSON(),
      postCount: category.posts ? category.posts.length : 0,
      posts: undefined,
    }))

    res.json({ categories: categoriesWithCount })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const category = await Category.findOne({ where: { slug } })

    if (!category) {
      return res.status(404).json({ error: "Category not found" })
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: { categoryId: category.id, published: true },
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
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    })

    res.json({
      category,
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
    console.error("Get category error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params

    const category = await Category.findByPk(id, {
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

    if (!category) {
      return res.status(404).json({ error: "Category not found" })
    }

    const categoryWithCount = {
      ...category.toJSON(),
      postCount: category.posts ? category.posts.length : 0,
      posts: undefined,
    }

    res.json({ category: categoryWithCount })
  } catch (error) {
    console.error("Get category by ID error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, description, color } = req.body
    const slug = createSlug(name)

    const category = await Category.create({
      name,
      slug,
      description,
      color: color || "#3B82F6",
    })

    res.status(201).json({
      message: "Category created successfully",
      category,
    })
  } catch (error) {
    console.error("Create category error:", error)
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Category name or slug already exists" })
    }
    res.status(500).json({ error: "Internal server error" })
  }
}

const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { name, description, color } = req.body

    const category = await Category.findByPk(id)
    if (!category) {
      return res.status(404).json({ error: "Category not found" })
    }

    const updateData = { description, color }
    if (name && name !== category.name) {
      updateData.name = name
      updateData.slug = createSlug(name)
    }

    await category.update(updateData)

    res.json({
      message: "Category updated successfully",
      category,
    })
  } catch (error) {
    console.error("Update category error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params

    const category = await Category.findByPk(id)
    if (!category) {
      return res.status(404).json({ error: "Category not found" })
    }

    // Check if category has posts
    const postCount = await Post.count({ where: { categoryId: id } })
    if (postCount > 0) {
      return res.status(400).json({
        error: "Cannot delete category with existing posts. Please move or delete posts first.",
      })
    }

    await category.destroy()

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Delete category error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
}
