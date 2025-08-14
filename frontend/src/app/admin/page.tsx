"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { authService } from "@/services/auth"
import { adminService, type DashboardStats, type AdminPost, type AdminUser } from "@/services/admin"
import { Users, FileText, Tag, MessageCircle, Eye, Heart, Shield, Activity } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import toast from "react-hot-toast"
import { uploadService } from "@/services/upload"

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentPosts, setRecentPosts] = useState<AdminPost[]>([])
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([])
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
      const response = await adminService.getDashboardStats()
      setStats(response.stats)
      setRecentPosts(response.recentPosts)
      setRecentUsers(response.recentUsers)
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Tổng quan và quản lý hệ thống blog</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats?.activeUsers || 0} hoạt động, {stats?.inactiveUsers || 0} bị khóa
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng bài viết</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPosts || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats?.publishedPosts || 0} đã xuất bản, {stats?.draftPosts || 0} nháp
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Danh mục</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCategories || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bình luận</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalComments || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Eye className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Lượt xem</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalViews?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Tổng lượt xem tất cả bài viết</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Heart className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Lượt thích</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats?.totalLikes?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Tổng lượt thích tất cả bài viết</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">Quản lý người dùng</h3>
                <p className="text-sm text-gray-600">Xem và quản lý tài khoản người dùng</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/posts"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-green-600 group-hover:text-green-700" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700">Quản lý bài viết</h3>
                <p className="text-sm text-gray-600">Kiểm duyệt và quản lý bài viết</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-purple-600 group-hover:text-purple-700" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700">Quản lý danh mục</h3>
                <p className="text-sm text-gray-600">Tạo và chỉnh sửa danh mục</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Posts */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 text-blue-600 mr-2" />
                Bài viết gần đây
              </h3>
            </div>
            <div className="p-6">
              {recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-start space-x-3">
                      {post.featuredImage ? (
                        <Image
                          src={uploadService.getImageUrl(post.featuredImage) || "/placeholder.svg"}
                          alt={post.title}
                          width={60}
                          height={40}
                          className="rounded object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-15 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/posts/${post.slug}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-500">
                          Bởi {post.author.fullName} •{" "}
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {post.viewCount || 0}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {post.likes?.length || 0}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có bài viết nào</p>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 text-green-600 mr-2" />
                Người dùng mới
              </h3>
            </div>
            <div className="p-6">
              {recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      {user.avatar ? (
                        <Image
                          src={uploadService.getImageUrl(user.avatar) || "/placeholder.svg"}
                          alt={user.fullName}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/users/${user.username}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {user.fullName}
                        </Link>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
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
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có người dùng mới</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
