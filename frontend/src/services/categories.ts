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
  posts: any[]
  pagination: {
    currentPage: number
    totalPages: number
    totalPosts: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreateCategoryData {
  name: string
  description?: string
  color: string
}

export interface UpdateCategoryData {
  name: string
  description?: string
  color: string
}

export const categoriesService = {
  async getAllCategories(): Promise<CategoryResponse> {
    const response = await api.get("/categories")
    return response.data
  },

  async getCategoryBySlug(slug: string, page = 1, limit = 10): Promise<CategoryPostsResponse> {
    const response = await api.get(`/categories/slug/${slug}?page=${page}&limit=${limit}`)
    return response.data
  },

  async getCategoryById(id: number): Promise<{ category: Category }> {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  async createCategory(data: CreateCategoryData): Promise<{ message: string; category: Category }> {
    const response = await api.post("/categories", data)
    return response.data
  },

  async updateCategory(id: number, data: UpdateCategoryData): Promise<{ message: string; category: Category }> {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },

  async deleteCategory(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },
}
