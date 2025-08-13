"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService, type User } from "@/services/auth"
import { UserIcon, Mail, Calendar, Edit2, Save, X, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import toast from "react-hot-toast"
import Link from "next/link"
import AvatarUpload from "@/components/AvatarUpload"

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(100, "Họ tên không được quá 100 ký tự"),
  bio: z.string().max(500, "Tiểu sử không được quá 500 ký tự").optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }

    loadProfile()
  }, [router])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const userData = await authService.getProfile()
      setUser(userData)
      reset({
        fullName: userData.fullName,
        bio: userData.bio || "",
      })
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Không thể tải thông tin profile")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpdate = async (newAvatar: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: newAvatar }
      setUser(updatedUser)

      // Dispatch event to update header
      window.dispatchEvent(new Event("authChange"))
    }
  }

  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true)
    try {
      const updatedUser = await authService.updateProfile({
        fullName: data.fullName,
        bio: data.bio,
      })

      setUser(updatedUser)
      setIsEditing(false)
      toast.success("Cập nhật profile thành công!")

      // Dispatch event to update header
      window.dispatchEvent(new Event("authChange"))
    } catch (error: any) {
      console.error("Update profile error:", error)
      const message = error.response?.data?.error || "Có lỗi xảy ra khi cập nhật profile"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (user) {
      reset({
        fullName: user.fullName,
        bio: user.bio || "",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem profile</p>
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12">
            <div className="flex items-center">
              <AvatarUpload currentAvatar={user.avatar} onAvatarUpdate={handleAvatarUpdate} size="lg" />

              <div className="ml-8 text-white">
                <h2 className="text-3xl font-bold">{user.fullName}</h2>
                <p className="text-blue-100 text-lg">@{user.username}</p>
                <div className="flex items-center mt-3">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      user.role === "admin" ? "bg-yellow-500 text-yellow-900" : "bg-blue-500 text-blue-100"
                    }`}
                  >
                    {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    {...register("fullName")}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập họ và tên"
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Tiểu sử
                  </label>
                  <textarea
                    {...register("bio")}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Viết vài dòng về bản thân..."
                  />
                  {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Thông tin cơ bản</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Họ và tên</p>
                          <p className="font-medium text-gray-900">{user.fullName}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Tham gia</p>
                          <p className="font-medium text-gray-900">
                            {formatDistanceToNow(new Date(user.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Tiểu sử</h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      {user.bio ? (
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{user.bio}</p>
                      ) : (
                        <p className="text-gray-500 italic">Chưa có tiểu sử</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                    Trạng thái tài khoản
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Đang hoạt động" : "Bị khóa"}
                    </span>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
