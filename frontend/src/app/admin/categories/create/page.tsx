"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService } from "@/services/auth"
import { categoriesService } from "@/services/categories"
import { Tag, ArrowLeft, Save, Shield } from "lucide-react"
import toast from "react-hot-toast"

const categorySchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự").max(100, "Tên danh mục không được quá 100 ký tự"),
  description: z.string().max(500, "Mô tả không được quá 500 ký tự").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Màu sắc không hợp lệ"),
})

type CategoryForm = z.infer<typeof categorySchema>

export default function CreateCategoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const currentUser = authService.getCurrentUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      color: "#3B82F6",
    },
  })

  const watchedColor = watch("color")
  const watchedName = watch("name")

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
    }
  }, [currentUser, router])

  const onSubmit = async (data: CategoryForm) => {
    setIsSubmitting(true)
    try {
      await categoriesService.createCategory(data)
      toast.success("Danh mục đã được tạo thành công!")
      router.push("/admin/categories")
    } catch (error: any) {
      console.error("Create category error:", error)
      const message = error.response?.data?.error || "Có lỗi xảy ra khi tạo danh mục"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href="/admin/categories"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Tag className="w-8 h-8 text-blue-600 mr-3" />
              Tạo danh mục mới
            </h1>
            <p className="text-gray-600 mt-1">Thêm danh mục mới cho blog</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên danh mục *
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên danh mục..."
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Nhập mô tả cho danh mục..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            {/* Color */}
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                Màu sắc *
              </label>
              <div className="flex items-center space-x-4">
                <input
                  {...register("color")}
                  type="color"
                  className="w-16 h-12 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  {...register("color")}
                  type="text"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#3B82F6"
                />
                <div
                  className="w-12 h-12 rounded-md border border-gray-300"
                  style={{ backgroundColor: watchedColor }}
                ></div>
              </div>
              {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>}
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Xem trước</label>
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <span
                  className="inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white"
                  style={{ backgroundColor: watchedColor }}
                >
                  {watchedName || "Tên danh mục"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">* Các trường bắt buộc</div>

              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/categories"
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Đang tạo..." : "Tạo danh mục"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
