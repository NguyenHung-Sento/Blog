"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService } from "@/services/auth"
import { categoriesService, type Category } from "@/services/categories"
import { Tag, Plus, Edit, Trash2, Search, Shield, Loader2, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const router = useRouter()
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
      return
    }
    loadCategories()
  }, [router])

  useEffect(() => {
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredCategories(filtered)
  }, [categories, searchTerm])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesService.getAllCategories()
      setCategories(response.categories)
    } catch (error) {
      console.error("Error loading categories:", error)
      toast.error("Không thể tải danh sách danh mục")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"? Hành động này không thể hoàn tác.`)) {
      return
    }

    setDeletingId(id)
    try {
      await categoriesService.deleteCategory(id)
      toast.success("Danh mục đã được xóa thành công")
      loadCategories()
    } catch (error: any) {
      console.error("Delete category error:", error)
      const message = error.response?.data?.error || "Có lỗi xảy ra khi xóa danh mục"
      toast.error(message)
    } finally {
      setDeletingId(null)
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
              <Tag className="w-8 h-8 text-blue-600 mr-3" />
              Quản lý danh mục
            </h1>
            <p className="text-gray-600 mt-1">Quản lý các danh mục bài viết</p>
            </div>
          </div>

          <Link
            href="/admin/categories/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm danh mục
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng danh mục</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Có bài viết</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter((cat) => (cat.postCount || 0) > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Tag className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trống</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter((cat) => (cat.postCount || 0) === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={deletingId === category.id}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Xóa"
                      >
                        {deletingId === category.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{category.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{category.postCount || 0} bài viết</span>
                    <span>#{category.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm ? "Không tìm thấy danh mục nào" : "Chưa có danh mục nào"}
            </p>
            <p className="text-gray-400 mb-6">
              {searchTerm ? "Thử tìm kiếm với từ khóa khác" : "Tạo danh mục đầu tiên cho blog của bạn"}
            </p>
            {!searchTerm && (
              <Link
                href="/admin/categories/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo danh mục đầu tiên
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
