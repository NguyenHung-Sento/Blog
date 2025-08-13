import api from "./api"

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  color: string
  postCount?: number
  createdAt: string
  updatedAt: string
}

export interface CategoryResponse {
  categories: Category[]
}

export interface CategoryPostsResponse {
  category: Category
  posts: Array<{
    id: number
    title: string
    excerpt?: string
    slug: string
    featuredImage?: string
    createdAt: string
    author: {
      id: number
      username: string
      fullName: string
      avatar?: string
    }
    likes: Array<{ userId: number }>
    comments?: Array<{ id: number }>
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalPosts: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const categoriesService = {
  async getAllCategories() {
    const response = await api.get("/categories")
    return response.data as CategoryResponse
  },

  async getCategoryBySlug(slug: string, page = 1, limit = 10) {
    const response = await api.get(`/categories/${slug}`, {
      params: { page, limit },
    })
    return response.data as CategoryPostsResponse
  },

  async createCategory(data: { name: string; description?: string; color?: string }) {
    const response = await api.post("/categories", data)
    return response.data.category as Category
  },

  async updateCategory(id: number, data: { name?: string; description?: string; color?: string }) {
    const response = await api.put(`/categories/${id}`, data)
    return response.data.category as Category
  },

  async deleteCategory(id: number) {
    await api.delete(`/categories/${id}`)
  },
}
