"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { postsService, type Post } from "@/services/posts"
import { categoriesService, type Category } from "@/services/categories"
import PostCard from "@/components/PostCard"
import { Search, Filter, X, Loader2 } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const initialCategory = searchParams.get("category") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalPosts: 0,
    hasNext: false,
    hasPrev: false,
  })

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (debouncedSearchQuery || selectedCategory) {
      searchPosts(1, true)
    } else {
      setPosts([])
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalPosts: 0,
        hasNext: false,
        hasPrev: false,
      })
    }
  }, [debouncedSearchQuery, selectedCategory])

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getAllCategories()
      setCategories(response.categories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const searchPosts = async (page = 1, reset = true) => {
    if (!debouncedSearchQuery && !selectedCategory) return

    try {
      setLoading(true)
      const categoryId = selectedCategory ? Number.parseInt(selectedCategory) : undefined
      const response = await postsService.getAllPosts(page, 10, debouncedSearchQuery, categoryId)

      if (reset) {
        setPosts(response.posts)
      } else {
        setPosts((prev) => [...prev, ...response.posts])
      }

      setPagination(response.pagination)
    } catch (error) {
      console.error("Error searching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (pagination.hasNext && !loading) {
      searchPosts(pagination.currentPage + 1, false)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setPosts([])
    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalPosts: 0,
      hasNext: false,
      hasPrev: false,
    })
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

  const selectedCategoryData = categories.find((cat) => cat.id.toString() === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tìm kiếm bài viết</h1>
          <p className="text-gray-600">Khám phá những bài viết thú vị</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Bộ lọc
              </button>

              {(searchQuery || selectedCategory) && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(searchQuery || selectedCategory) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Từ khóa: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="ml-2 text-blue-600 hover:text-blue-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategoryData && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Danh mục: {selectedCategoryData.name}
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div>
          {loading && posts.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Đang tìm kiếm...</p>
            </div>
          ) : posts.length > 0 ? (
            <>
              {/* Results Header */}
              <div className="mb-6">
                <p className="text-gray-600">
                  Tìm thấy <span className="font-semibold">{pagination.totalPosts}</span> kết quả
                  {searchQuery && (
                    <span>
                      {" "}
                      cho từ khóa "<span className="font-semibold">{searchQuery}</span>"
                    </span>
                  )}
                  {selectedCategoryData && (
                    <span>
                      {" "}
                      trong danh mục <span className="font-semibold">{selectedCategoryData.name}</span>
                    </span>
                  )}
                </p>
              </div>

              {/* Posts Grid */}
              <div className="space-y-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onLikeUpdate={handleLikeUpdate} />
                ))}
              </div>

              {/* Load More */}
              {pagination.hasNext && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                  >
                    {loading ? (
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
          ) : searchQuery || selectedCategory ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Không tìm thấy kết quả nào</p>
              <p className="text-gray-400">Thử thay đổi từ khóa hoặc bộ lọc khác</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nhập từ khóa để bắt đầu tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
