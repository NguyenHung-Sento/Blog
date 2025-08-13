"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService } from "@/services/auth"
import { adminService, type DashboardResponse } from "@/services/admin"
import { categoriesService, type Category } from "@/services/categories"
import { Users, FileText, Tag, BarChart3, Settings, Shield, Eye, Heart, MessageCircle, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import toast from "react-hot-toast"

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
      return
    }
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load dashboard stats and recent data
      const dashboardResponse = await adminService.getDashboardStats()
      setDashboardData(dashboardResponse)

      // Load categories
      const categoriesResponse = await categoriesService.getAllCategories()
      setCategories(categoriesResponse.categories)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("Không thể tải dữ liệu dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này</p>
          <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = dashboardData?.stats

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Quản lý toàn bộ hệ thống blog</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Dashboard cá nhân
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats?.activeUsers || 0} hoạt động, {stats?.inactiveUsers || 0} bị khóa
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bài viết</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPosts || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats?.publishedPosts || 0} xuất bản, {stats?.draftPosts || 0} nháp
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Danh mục</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCategories || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lượt xem</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lượt thích</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalLikes || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bình luận</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalComments || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Posts */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Bài viết gần đây</h2>
              <Link href="/admin/posts" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Xem tất cả
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData?.recentPosts.map((post) => (
                  <div key={post.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {post.published ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      ) : (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        bởi {post.author.fullName} •{" "}
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {post.viewCount}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {post.likes.length}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {post.comments?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Người dùng mới</h2>
              <Link href="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Xem tất cả
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData?.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/users/${user.username}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {user.fullName}
                      </Link>
                      <p className="text-xs text-gray-500">
                        @{user.username} •{" "}
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Management */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Quản lý danh mục</h2>
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/categories/create"
                className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.slice(0, 6).map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.postCount || 0} bài viết</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Sửa
                  </Link>
                </div>
              ))}
            </div>
            {categories.length > 6 && (
              <div className="mt-4 text-center">
                <Link href="/admin/categories" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Xem tất cả ({categories.length} danh mục)
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Thao tác nhanh</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/users"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Quản lý người dùng</p>
                  <p className="text-sm text-gray-500">Xem và quản lý tài khoản</p>
                </div>
              </Link>

              <Link
                href="/admin/posts"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Quản lý bài viết</p>
                  <p className="text-sm text-gray-500">Duyệt và chỉnh sửa bài viết</p>
                </div>
              </Link>

              <Link
                href="/admin/categories"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Tag className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Quản lý danh mục</p>
                  <p className="text-sm text-gray-500">Thêm và sửa danh mục</p>
                </div>
              </Link>

              <Link
                href="/admin/analytics"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="w-8 h-8 text-indigo-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Thống kê</p>
                  <p className="text-sm text-gray-500">Xem báo cáo chi tiết</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
