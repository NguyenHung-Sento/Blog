"use client"

import { useState, useEffect } from "react"
import { postsService, type Post } from "@/services/posts"
import PostCard from "@/components/PostCard"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async (pageNum = 1, reset = true) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await postsService.getAllPosts(pageNum, 10)

      if (reset) {
        setPosts(response.posts)
      } else {
        setPosts((prev) => [...prev, ...response.posts])
      }

      setHasMore(response.pagination.hasNext)
      setPage(pageNum)
      setError(null)
    } catch (err) {
      console.error("Error loading posts:", err)
      setError("Không thể tải bài viết. Vui lòng thử lại.")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1, false)
    }
  }

  const handleLikeUpdate = (postId: number, liked: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id
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
    )
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => loadPosts()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chào mừng đến với Blog2Z</h1>
          <p className="text-xl text-gray-600">Khám phá những câu chuyện thú vị và chia sẻ kiến thức</p>
        </div>

        <div className="space-y-8">
          {posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onLikeUpdate={handleLikeUpdate} />
              ))}

              {hasMore && (
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
              <p className="text-gray-500 text-lg">Chưa có bài viết nào. Hãy là người đầu tiên viết bài!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
