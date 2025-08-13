"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { categoriesService, type CategoryPostsResponse } from "@/services/categories"
import PostCard from "@/components/PostCard"
import CategoryBadge from "@/components/CategoryBadge"
import { Loader2, ArrowLeft, Tag } from "lucide-react"
import Link from "next/link"

export default function CategoryDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [data, setData] = useState<CategoryPostsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (slug) {
      loadCategoryData()
    }
  }, [slug])

  const loadCategoryData = async (pageNum = 1, reset = true) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await categoriesService.getCategoryBySlug(slug, pageNum, 10)

      if (reset) {
        setData(response)
      } else {
        setData((prev) => {
          if (!prev) return response
          return {
            ...response,
            posts: [...prev.posts, ...response.posts],
          }
        })
      }

      setPage(pageNum)
      setError(null)
    } catch (err: any) {
      console.error("Error loading category:", err)
      if (err.response?.status === 404) {
        setError("Danh mục không tồn tại")
      } else {
        setError("Không thể tải danh mục. Vui lòng thử lại.")
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMorePosts = () => {
    if (!loadingMore && data?.pagination.hasNext) {
      loadCategoryData(page + 1, false)
    }
  }

  const handleLikeUpdate = (postId: number, liked: boolean) => {
    if (!data) return

    setData((prev) => {
      if (!prev) return prev

      const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id

      return {
        ...prev,
        posts: prev.posts.map((post) => {
          if (post.id === postId) {
            if (liked) {
              return {
                ...post,
                likes: [...post.likes, { userId: currentUserId }],
              }
            } else {
              return {
                ...post,
                likes: post.likes.filter((like) => like.userId !== currentUserId),
              }
            }
          }
          return post
        }),
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">{error || "Danh mục không tồn tại"}</p>
            <Link
              href="/categories"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Về trang danh mục
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/categories"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh mục
          </Link>
        </div>

        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Danh mục: {data.category.name}</h1>
          </div>

          <div className="mb-4">
            <CategoryBadge category={data.category} />
          </div>

          {data.category.description && <p className="text-xl text-gray-600 mb-4">{data.category.description}</p>}

          <p className="text-gray-500">{data.pagination.totalPosts} bài viết trong danh mục này</p>
        </div>

        {/* Posts */}
        <div className="space-y-8">
          {data.posts.length > 0 ? (
            <>
              {data.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    category: data.category,
                    author: post.author,
                    likes: post.likes || [],
                    comments: post.comments || [],
                    viewCount: 0, // API doesn't return viewCount for category posts
                    content: "", // Not needed for card display
                    published: true,
                    publishedAt: post.createdAt,
                    updatedAt: post.createdAt,
                  }}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}

              {/* Load More */}
              {data.pagination.hasNext && (
                <div className="text-center py-8">
                  <button
                    onClick={loadMorePosts}
                    disabled={loadingMore}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Đang tải...
                      </>
                    ) : (
                      "Tải thêm bài viết"
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có bài viết nào trong danh mục này.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
