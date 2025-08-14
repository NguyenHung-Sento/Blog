"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { authService } from "@/services/auth"
import { adminService, type AdminUser } from "@/services/admin"
import {
  Users,
  Shield,
  ArrowLeft,
  Search,
  Ban,
  CheckCircle,
  Trash2,
  UserCog,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import toast from "react-hot-toast"
import { uploadService } from "@/services/upload"
import LoadingLink from "@/components/LoadingLink"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  const router = useRouter()
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
      return
    }
    loadUsers()
  }, [currentPage, searchQuery, roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAllUsers(currentPage, 20, searchQuery, roleFilter, statusFilter)
      setUsers(response.users)
      setTotalPages(response.pagination.totalPages)
      setTotalUsers(response.pagination.totalUsers)
      setHasNext(response.pagination.hasNext)
      setHasPrev(response.pagination.hasPrev)
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Không thể tải danh sách người dùng")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await adminService.updateUserStatus(userId, !currentStatus)
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, isActive: !currentStatus } : user)))
      toast.success(currentStatus ? "Đã khóa tài khoản" : "Đã kích hoạt tài khoản")
    } catch (error) {
      console.error("Error toggling user status:", error)
      toast.error("Có lỗi xảy ra")
    }
  }

  const handleToggleUserRole = async (userId: number, currentRole: "user" | "admin") => {
    const newRole = currentRole === "admin" ? "user" : "admin"
    if (
      !confirm(`Bạn có chắc chắn muốn thay đổi vai trò thành ${newRole === "admin" ? "Quản trị viên" : "Người dùng"}?`)
    ) {
      return
    }

    try {
      await adminService.updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
      toast.success("Đã cập nhật vai trò người dùng")
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Có lỗi xảy ra")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.")) {
      return
    }

    try {
      await adminService.deleteUser(userId)
      setUsers((prev) => prev.filter((user) => user.id !== userId))
      toast.success("Đã xóa người dùng")
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast.error(error.response?.data?.error || "Có lỗi xảy ra")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadUsers()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="sr-only">Previous</span>
      </button>,
    )

    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          1
        </button>,
      )
      if (startPage > 2) {
        buttons.push(
          <span
            key="ellipsis1"
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
            ...
          </span>,
        )
      }
    }

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            currentPage === page
              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>,
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span
            key="ellipsis2"
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
            ...
          </span>,
        )
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {totalPages}
        </button>,
      )
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNext}
        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">Next</span>
        <ChevronRight className="w-5 h-5" />
      </button>,
    )

    return buttons
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này</p>
          <LoadingLink
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            loadingText="Đang về trang chủ..."
          >
            Về trang chủ
          </LoadingLink>
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
            <LoadingLink
              href="/admin"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              loadingText="Đang quay lại Admin..."
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Admin
            </LoadingLink>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                Quản lý người dùng
              </h1>
              <p className="text-gray-600 mt-1">Quản lý tài khoản và quyền người dùng</p>
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
                placeholder="Tìm kiếm người dùng..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Người dùng</option>
              <option value="admin">Quản trị viên</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Bị khóa</option>
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
              Hiển thị {users.length} / {totalUsers} người dùng
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoạt động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tham gia
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
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
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{user.postCount} bài viết</div>
                        <div className="text-gray-500">{user.commentCount} bình luận</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            className={`p-2 rounded-md transition-colors ${
                              user.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                            }`}
                            title={user.isActive ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
                          >
                            {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleToggleUserRole(user.id, user.role)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                            title="Thay đổi vai trò"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>

                          <LoadingLink
                            href={`/users/${user.username}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Xem profile"
                            loadingText="Đang tải profile..."
                          >
                            <Users className="w-4 h-4" />
                          </LoadingLink>

                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Xóa người dùng"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="text-sm text-gray-700 flex items-center">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> đến{" "}
                    <span className="font-medium">{Math.min(currentPage * 20, totalUsers)}</span> trong{" "}
                    <span className="font-medium">{totalUsers}</span> kết quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {renderPaginationButtons()}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
