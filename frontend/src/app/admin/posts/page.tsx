"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { authService } from "@/services/auth"
import { adminService, type AdminPost } from "@/services/admin"
import { categoriesService, type Category } from "@/services/categories"
import {
  FileText,
  Shield,
  ArrowLeft,
  Search,
  Eye,
  Heart,
  MessageCircle,
  Edit2,
  Trash2,
  CheckCircle,
  X,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import toast from "react-hot-toast"
import { uploadService } from "@/services/upload"

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)

  const router = useRouter()
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
      return
    }
    loadCategories()
  }, [])

  useEffect(() => {
    loadPosts()
  }, [currentPage, searchQuery, statusFilter, categoryFilter])

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getAllCategories()
      setCategories(response.categories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAllPosts(currentPage, 20, searchQuery, statusFilter, categoryFilter)
      setPosts(response.posts)
      setTotalPages(response.pagination.totalPages)
      setTotalPosts(response.pagination.totalPosts)
    } catch (error) {
      console.error("Error loading posts:", error)
      toast.error("Không thể tải danh sách bài viết")
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePostStatus = async (postId: number, currentStatus: boolean) => {
    try {
      await adminService.updatePostStatus(postId, !currentStatus)
      setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, published: !currentStatus } : post)))
      toast.success(currentStatus ? "Đã ẩn bài viết" : "Đã xuất bản bài viết")
    } catch (error) {
      console.error("Error toggling post status:", error)
      toast.error("Có lỗi xảy ra")
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.")) {
      return
    }

    try {
      await adminService.deletePost(postId)
      setPosts((prev) => prev.filter((post) => post.id !== postId))
      toast.success("Đã xóa bài viết")
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Có lỗi xảy ra")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadPosts()
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/admin"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Admin
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                Quản lý bài viết
              </h1>
              <p className="text-gray-600 mt-1">Quản lý và kiểm duyệt bài viết</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Search Button */}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm
            </button>

            {/* Stats */}
            <div className="text-sm text-gray-600 flex items-center">
              Hiển thị {posts.length} / {totalPosts} bài viết
            </div>
          </form>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.featuredImage && (
                  <div className="aspect-video relative">
                    <Image
                      src={uploadService.getImageUrl(post.featuredImage) || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        post.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {post.published ? "Đã xuất bản" : "Bản nháp"}
                    </span>

                    {post.category && (
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: post.category.color + "20",
                          color: post.category.color,
                        }}
                      >
                        {post.category.name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt || post.content.substring(0, 100) + "..."}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span>bởi {post.author.fullName}</span>
                    </div>
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
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

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTogglePostStatus(post.id, post.published)}
                        className={`p-2 rounded-md transition-colors ${
                          post.published ? "text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50"
                        }`}
                        title={post.published ? "Ẩn bài viết" : "Xuất bản bài viết"}
                      >
                        {post.published ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>

                      <Link
                        href={`/posts/${post.slug}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Xem bài viết"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/edit-post/${post.id}`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không tìm thấy bài viết nào</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> đến{" "}
                    <span className="font-medium">{Math.min(currentPage * 20, totalPosts)}</span> trong{" "}
                    <span className="font-medium">{totalPosts}</span> kết quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
