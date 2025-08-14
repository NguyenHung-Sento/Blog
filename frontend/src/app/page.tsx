"use client"

import { useState, useEffect, useCallback } from "react"
import { postsService, type Post } from "@/services/posts"
import { authService } from "@/services/auth"
import PostCard from "@/components/PostCard"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { Loader2, TrendingUp, Clock, Users, Globe } from "lucide-react"

type FeedType = "all" | "following"
type SortType = "newest" | "popular"

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [feedType, setFeedType] = useState<FeedType>("all")
  const [sortType, setSortType] = useState<SortType>("newest")

  const currentUser = authService.getCurrentUser()

  const loadPosts = useCallback(
    async (pageNum = 1, reset = true) => {
      try {
        if (pageNum === 1) {
          setLoading(true)
        } else {
          setLoadingMore(true)
        }

        let response
        if (feedType === "following" && currentUser) {
          response = await postsService.getFollowingPosts(pageNum, 10, sortType)
        } else {
          response = await postsService.getAllPosts(pageNum, 10, "", undefined, sortType)
        }

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
    },
    [feedType, sortType, currentUser],
  )

  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1, false)
    }
  }, [loadPosts, loadingMore, hasMore, page])

  const { loadingRef } = useInfiniteScroll({
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMorePosts,
    threshold: 200,
  })

  useEffect(() => {
    loadPosts(1, true)
  }, [feedType, sortType])

  const handleLikeUpdate = (postId: number, liked: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const currentUserId = currentUser?.id
          if (currentUserId) {
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
        }
        return post
      }),
    )
  }

  const handleFeedTypeChange = (type: FeedType) => {
    if (type === "following" && !currentUser) {
      return // Không cho phép chọn following nếu chưa đăng nhập
    }
    setFeedType(type)
    setPage(1)
  }

  const handleSortTypeChange = (type: SortType) => {
    setSortType(type)
    setPage(1)
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
              onClick={() => loadPosts(1, true)}
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chào mừng đến với Blog2Z</h1>
          <p className="text-xl text-gray-600">Khám phá những câu chuyện thú vị và chia sẻ kiến thức</p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Feed Type Filter */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleFeedTypeChange("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  feedType === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Globe className="w-4 h-4 inline mr-1" />
                Khám phá
              </button>
              {currentUser && (
                <button
                  onClick={() => handleFeedTypeChange("following")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    feedType === "following" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  Đang theo dõi
                </button>
              )}
            </div>

            {/* Sort Type Filter */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleSortTypeChange("newest")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortType === "newest" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Mới nhất
              </button>
              <button
                onClick={() => handleSortTypeChange("popular")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortType === "popular" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Nổi bật
              </button>
            </div>
          </div>

          {feedType === "following" && posts.length === 0 && !loading && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-700 text-sm">
                Bạn chưa theo dõi ai. Hãy tìm và theo dõi những tác giả yêu thích để xem bài viết của họ ở đây!
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onLikeUpdate={handleLikeUpdate} />
              ))}

              {/* Infinite Scroll Trigger */}
              <div ref={loadingRef} className="flex justify-center py-8">
                {loadingMore && (
                  <div className="flex items-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Đang tải thêm bài viết...</span>
                  </div>
                )}
                {!hasMore && posts.length > 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <div className="inline-flex items-center">
                      <div className="h-px bg-gray-300 flex-1 mr-4"></div>
                      <span className="text-sm">Bạn đã xem hết tất cả bài viết</span>
                      <div className="h-px bg-gray-300 flex-1 ml-4"></div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {feedType === "following"
                  ? "Không có bài viết từ những người bạn theo dõi."
                  : "Chưa có bài viết nào. Hãy là người đầu tiên viết bài!"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
