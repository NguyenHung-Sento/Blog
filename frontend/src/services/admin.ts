import api from "./api"

export interface AdminUser {
  id: number
  username: string
  fullName: string
  email: string
  avatar?: string
  role: "user" | "admin"
  isActive: boolean
  createdAt: string
  updatedAt: string
  postCount: number
  commentCount: number
}

export interface AdminPost {
  id: number
  title: string
  content: string
  excerpt?: string
  slug: string
  featuredImage?: string
  published: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  viewCount: number
  author: {
    id: number
    username: string
    fullName: string
    avatar?: string
  }
  category?: {
    id: number
    name: string
    slug: string
    color: string
  }
  likes: Array<{ userId: number }>
  comments?: Array<{ id: number }>
}

export interface DashboardStats {
  totalUsers: number
  totalPosts: number
  totalCategories: number
  totalComments: number
  totalViews: number
  totalLikes: number
  publishedPosts: number
  draftPosts: number
  activeUsers: number
  inactiveUsers: number
}

export interface AdminUsersResponse {
  users: AdminUser[]
  pagination: {
    currentPage: number
    totalPages: number
    totalUsers: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface AdminPostsResponse {
  posts: AdminPost[]
  pagination: {
    currentPage: number
    totalPages: number
    totalPosts: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface DashboardResponse {
  stats: DashboardStats
  recentPosts: AdminPost[]
  recentUsers: AdminUser[]
}

export const adminService = {
  // Dashboard
  async getDashboardStats() {
    const response = await api.get("/admin/dashboard")
    return response.data as DashboardResponse
  },

  // User Management
  async getAllUsers(page = 1, limit = 20, search = "", role = "", status = "") {
    const response = await api.get("/admin/users", {
      params: { page, limit, search, role, status },
    })
    return response.data as AdminUsersResponse
  },

  async getUserById(id: number) {
    const response = await api.get(`/admin/users/${id}`)
    return response.data.user as AdminUser
  },

  async updateUserStatus(id: number, isActive: boolean) {
    const response = await api.patch(`/admin/users/${id}/status`, { isActive })
    return response.data
  },

  async updateUserRole(id: number, role: "user" | "admin") {
    const response = await api.patch(`/admin/users/${id}/role`, { role })
    return response.data
  },

  async deleteUser(id: number) {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },

  // Post Management
  async getAllPosts(page = 1, limit = 20, search = "", status = "", category = "") {
    const response = await api.get("/admin/posts", {
      params: { page, limit, search, status, category },
    })
    return response.data as AdminPostsResponse
  },

  async updatePostStatus(id: number, published: boolean) {
    const response = await api.patch(`/admin/posts/${id}/status`, { published })
    return response.data
  },

  async deletePost(id: number) {
    const response = await api.delete(`/admin/posts/${id}`)
    return response.data
  },
}
