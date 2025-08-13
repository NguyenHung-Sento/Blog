import api from "./api"

export interface Post {
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
    bio?: string
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

export interface CreatePostData {
  title: string
  content: string
  excerpt?: string
  published?: boolean
  categoryId?: number
}

export interface PostsResponse {
  posts: Post[]
  pagination: {
    currentPage: number
    totalPages: number
    totalPosts: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const postsService = {
  async getAllPosts(page = 1, limit = 10, search = "", categoryId?: number) {
    const response = await api.get("/posts", {
      params: { page, limit, search, category: categoryId },
    })
    return response.data as PostsResponse
  },

  async getPostBySlug(slug: string) {
    const response = await api.get(`/posts/${slug}`)
    return response.data.post as Post
  },

  async createPost(data: CreatePostData) {
    const response = await api.post("/posts", data)
    return response.data.post as Post
  },

  async updatePost(id: number, data: Partial<CreatePostData>) {
    const response = await api.put(`/posts/${id}`, data)
    return response.data.post as Post
  },

  async deletePost(id: number) {
    await api.delete(`/posts/${id}`)
  },

  async toggleLike(id: number) {
    const response = await api.post(`/posts/${id}/like`)
    return response.data
  },

  async getUserPosts(page = 1, limit = 10) {
    const response = await api.get("/posts/my-posts", {
      params: { page, limit },
    })
    return response.data as PostsResponse
  },
}
