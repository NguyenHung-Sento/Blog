import api from "./api"

export interface Comment {
  id: number
  content: string
  createdAt: string
  updatedAt: string
  postId: number
  authorId: number
  parentId?: number
  author: {
    id: number
    username: string
    fullName: string
    avatar?: string
  }
  replies?: Comment[]
}

export interface CreateCommentData {
  content: string
  postId: number
  parentId?: number
}

export interface CommentsResponse {
  comments: Comment[]
  pagination: {
    currentPage: number
    totalPages: number
    totalComments: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const commentsService = {
  async getCommentsByPost(postId: number, page = 1, limit = 20) {
    const response = await api.get(`/comments/post/${postId}`, {
      params: { page, limit },
    })
    return response.data as CommentsResponse
  },

  async createComment(data: CreateCommentData) {
    const response = await api.post("/comments", data)
    return response.data.comment as Comment
  },

  async updateComment(id: number, content: string) {
    const response = await api.put(`/comments/${id}`, { content })
    return response.data.comment as Comment
  },

  async deleteComment(id: number) {
    await api.delete(`/comments/${id}`)
  },
}
