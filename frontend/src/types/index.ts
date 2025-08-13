export interface User {
  id: number
  username: string
  email: string
  fullName: string
  avatar?: string
  bio?: string
  role?: "user" | "admin"
  isActive: boolean
  createdAt: string
  updatedAt: string
}

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
  authorId: number
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
    createdAt?: string
    updatedAt?: string
  }
  likes: Array<{ userId: number }>
  comments?: Array<{ id: number }>
}

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

export interface Like {
  id: number
  postId: number
  userId: number
  createdAt: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PostsResponse {
  posts: Post[]
  pagination: PaginationInfo
}

export interface CommentsResponse {
  comments: Comment[]
  pagination: PaginationInfo
}
