"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { postsService, type Post } from "@/services/posts"
import { authService } from "@/services/auth"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { PenTool, Eye, Heart, MessageCircle, Edit2, Trash2, Plus, FileText, BarChart3, Settings } from "lucide-react"
import toast from "react-hot-toast"

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalLikes: 0,
  })
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all")

  const router = useRouter()
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
      return
    }
    loadUserPosts()
  }, [])

  const loadUserPosts = async () => {
    try {
      setLoading(true)
      const response = await postsService.getUserPosts(1, 50) // Load more posts for dashboard
      setPosts(response.posts)

      // Calculate stats
      const totalPosts = response.posts.length
      const publishedPosts = response.posts.filter((post) => post.published).length
      const draftPosts = totalPosts - publishedPosts
      const totalViews = response.posts.reduce((sum, post) => sum + post.viewCount, 0)
      const totalLikes = response.posts.reduce((sum, post) => sum + post.likes.length, 0)

      setStats({
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews,
        totalLikes,
      })
    } catch (error) {
      console.error("Error loading posts:", error)
      toast.error("Không thể tải bài viết")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return

    try {
      await postsService.deletePost(postId)
      setPosts(posts.filter((post) => post.id !== postId))
      toast.success("Xóa bài viết thành công")

      // Recalculate stats
      const updatedPosts = posts.filter((post) => post.id !== postId)
      const totalPosts = updatedPosts.length
      const publishedPosts = updatedPosts.filter((post) => post.published).length
      const draftPosts = totalPosts - publishedPosts
      const totalViews = updatedPosts.reduce((sum, post) => sum + post.viewCount, 0)
      const totalLikes = updatedPosts.reduce((sum, post) => sum + post.likes.length, 0)

      setStats({
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews,
        totalLikes,
      })
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Có lỗi xảy ra khi xóa bài viết")
    }
  }

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "published") return post.published
    if (activeTab === "draft") return !post.published
    return true
  })

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để truy cập dashboard</p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Chào mừng trở lại, {currentUser.fullName}!</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Cài đặt
            </Link>
            <Link
              href="/create-post"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Viết bài mới
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng bài viết</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <PenTool className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bản nháp</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draftPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lượt xem</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lượt thích</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Bài viết của bạn</h2>

              {/* Tabs */}
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "all" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Tất cả ({stats.totalPosts})
                </button>
                <button
                  onClick={() => setActiveTab("published")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "published" ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Đã xuất bản ({stats.publishedPosts})
                </button>
                <button
                  onClick={() => setActiveTab("draft")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "draft" ? "bg-yellow-100 text-yellow-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Bản nháp ({stats.draftPosts})
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link
                          href={`/posts/${post.slug}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.published ? "Đã xuất bản" : "Bản nháp"}
                        </span>
                        {post.category && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: post.category.color + "20",
                              color: post.category.color,
                            }}
                          >
                            {post.category.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {post.viewCount}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes.length}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comments?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Xem bài viết"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/edit-post/${post.id}`}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">
                  {activeTab === "all" && "Bạn chưa có bài viết nào"}
                  {activeTab === "published" && "Bạn chưa có bài viết đã xuất bản"}
                  {activeTab === "draft" && "Bạn chưa có bản nháp nào"}
                </p>
                <Link
                  href="/create-post"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Viết bài đầu tiên
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
