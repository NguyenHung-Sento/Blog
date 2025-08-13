"use client"

import { useState, useEffect } from "react"
import { postsService, type Post, type PostsResponse } from "@/services/posts"
import toast from "react-hot-toast"

export function usePosts(initialPage = 1, limit = 10, search = "") {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalPosts: 0,
    hasNext: false,
    hasPrev: false,
  })

  const loadPosts = async (page = 1, searchQuery = search, reset = true) => {
    try {
      setLoading(true)
      const response = await postsService.getAllPosts(page, limit, searchQuery)
      
      if (reset) {
        setPosts(response.posts)
      } else {
        setPosts(prev => [...prev, ...response.posts])
      }
      
      setPagination(response.pagination)
      setError(null)
    } catch (err) {
      console.error("Error loading posts:", err)
      setError("Không thể tải bài viết. Vui lòng thử lại.")
      toast.error("Không thể tải bài viết")
    } finally {
      setLoading(false)
    }
  }

  const refreshPosts = () => {
    loadPosts(1, search, true)
  }

  const loadMorePosts = () => {
    if (pagination.hasNext && !loading) {
      loadPosts(pagination.currentPage + 1, search, false)
    }
  }

  const updatePostLike = (postId: number, liked: boolean, userId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          if (liked) {
            return {
              ...post,
              likes: [...post.likes, { userId }],
            }
          } else {
            return {
              ...post,
              likes: post.likes.filter(like => like.userId !== userId),
            }
          }
        }
        return post
      })
    )
  }

  useEffect(() => {
    loadPosts(initialPage, search, true)
  }, [initialPage, search])

  return {
    posts,
    loading,
    error,
    pagination,
    loadPosts,
    refreshPosts,
    loadMorePosts,
    updatePostLike,
  }
}
