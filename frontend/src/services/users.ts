import api from "./api"

export interface UserProfile {
  id: number
  username: string
  fullName: string
  avatar?: string
  bio?: string
  postCount: number
  createdAt: string
  followStats: {
    followers: number
    following: number
  }
}

export interface UserPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  viewCount: number
  createdAt: string
  updatedAt: string
  author: {
    id: number
    username: string
    fullName: string
    avatar?: string
  }
  category: {
    id: number
    name: string
    slug: string
    color: string
  }
  likes: Array<{ userId: number }>
  userLiked: boolean
  commentsCount: number
}

export interface UserPostsResponse {
  posts: UserPost[]
  pagination: {
    currentPage: number
    totalPages: number
    totalPosts: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const usersService = {
  // Get user profile by username
  async getUserByUsername(username: string): Promise<UserProfile> {
    const response = await api.get(`/users/${username}`)
    return response.data.data
  },

  // Get user posts by username
  async getUserPosts(username: string, page = 1, limit = 6): Promise<UserPostsResponse> {
    const response = await api.get(`/users/${username}/posts`, {
      params: { page, limit },
    })
    return response.data.data
  },

  // Get current user profile
  async getCurrentUser() {
    const response = await api.get("/users/me/profile")
    return response.data.data
  },

  // Update user profile
  async updateProfile(data: { fullName?: string; bio?: string }) {
    const response = await api.put("/users/me/profile", data)
    return response.data
  },

  // Update avatar
  async updateAvatar(file: File) {
    const formData = new FormData()
    formData.append("avatar", file)

    const response = await api.put("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
}
