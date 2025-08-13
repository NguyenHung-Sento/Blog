const { validationResult } = require("express-validator")
const { Comment, User, Post } = require("../models")

const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { postId, parentId: null },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "fullName", "avatar"],
        },
        {
          model: Comment,
          as: "replies",
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "username", "fullName", "avatar"],
            },
          ],
          order: [["createdAt", "ASC"]],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    })

    res.json({
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalComments: count,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get comments error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const createComment = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { content, postId, parentId } = req.body
    const authorId = req.user.id

    // Check if post exists
    const post = await Post.findByPk(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    // Check if parent comment exists (for replies)
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId)
      if (!parentComment || parentComment.postId !== Number.parseInt(postId)) {
        return res.status(404).json({ error: "Parent comment not found" })
      }
    }

    const comment = await Comment.create({
      content,
      postId,
      authorId,
      parentId: parentId || null,
    })

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "fullName", "avatar"],
        },
      ],
    })

    res.status(201).json({
      message: "Comment created successfully",
      comment: commentWithAuthor,
    })
  } catch (error) {
    console.error("Create comment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { content } = req.body
    const userId = req.user.id

    const comment = await Comment.findOne({
      where: { id, authorId: userId },
    })

    if (!comment) {
      return res.status(404).json({ error: "Comment not found or unauthorized" })
    }

    await comment.update({ content })

    const updatedComment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "fullName", "avatar"],
        },
      ],
    })

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    })
  } catch (error) {
    console.error("Update comment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const comment = await Comment.findOne({
      where: { id, authorId: userId },
    })

    if (!comment) {
      return res.status(404).json({ error: "Comment not found or unauthorized" })
    }

    await comment.destroy()

    res.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
}
