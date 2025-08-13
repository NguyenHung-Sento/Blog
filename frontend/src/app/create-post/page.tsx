"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { postsService } from "@/services/posts"
import { categoriesService, type Category } from "@/services/categories"
import { authService } from "@/services/auth"
import { Loader2, Save, Eye, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"
import dynamic from "next/dynamic"
import FeaturedImageUpload from "@/components/FeaturedImageUpload"

// Dynamically import CKEditor to avoid SSR issues
const CKEditor = dynamic(() => import("@/components/CKEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 border border-gray-300 rounded-md flex items-center justify-center">
      <div className="text-gray-500">Đang tải trình soạn thảo...</div>
    </div>
  ),
})

const postSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự").max(255, "Tiêu đề không được quá 255 ký tự"),
  content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự").max(50000, "Nội dung không được quá 50000 ký tự"),
  excerpt: z.string().max(500, "Tóm tắt không được quá 500 ký tự").optional(),
  categoryId: z.string().optional(),
  published: z.boolean().default(false),
})

type PostForm = z.infer<typeof postSchema>

export default function CreatePostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isPreview, setIsPreview] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const router = useRouter()

  const currentUser = authService.getCurrentUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      published: false,
      content: "",
    },
  })

  const watchedTitle = watch("title")

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
      return
    }
    loadCategories()
  }, [])

  // Update form content when CKEditor content changes
  useEffect(() => {
    setValue("content", content)
    trigger("content")
  }, [content, setValue, trigger])

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getAllCategories()
      setCategories(response.categories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const handleContentChange = useCallback((data: string) => {
    setContent(data)
  }, [])

  const onSubmit = async (data: PostForm) => {
    setIsSubmitting(true)
    try {
      const postData = {
        title: data.title,
        content: content,
        excerpt: data.excerpt,
        published: data.published,
        categoryId: data.categoryId ? Number.parseInt(data.categoryId) : undefined,
        featuredImage,
      }

      const post = await postsService.createPost(postData)
      toast.success(data.published ? "Bài viết đã được xuất bản!" : "Bài viết đã được lưu nháp!")
      router.push(`/posts/${post.slug}`)
    } catch (error: any) {
      console.error("Create post error:", error)
      const message = error.response?.data?.error || "Có lỗi xảy ra khi tạo bài viết"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    setValue("published", false)
    handleSubmit(onSubmit)()
  }

  const handlePublish = () => {
    setValue("published", true)
    handleSubmit(onSubmit)()
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để viết bài</p>
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
      <div className="max-w-5xl mx-auto px-4 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900">Viết bài mới</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 rounded-md"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? "Chỉnh sửa" : "Xem trước"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {isPreview ? (
            /* Preview Mode */
            <div className="p-8">
              {featuredImage && (
                <div className="mb-8">
                  <img
                    src={
                      featuredImage.startsWith("http")
                        ? featuredImage
                        : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${featuredImage}`
                    }
                    alt="Featured image"
                    className="w-full h-80 object-cover rounded-lg"
                  />
                </div>
              )}
              <h1 className="text-4xl font-bold text-gray-900 mb-6">{watchedTitle || "Tiêu đề bài viết"}</h1>
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: content || "Nội dung bài viết sẽ hiển thị ở đây...",
                }}
              />
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
              {/* Featured Image Upload */}
              <FeaturedImageUpload currentImage={featuredImage} onImageUpdate={setFeaturedImage} />

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-3">
                  Tiêu đề bài viết *
                </label>
                <input
                  {...register("title")}
                  type="text"
                  className="w-full px-4 py-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề bài viết..."
                />
                {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-3">
                  Danh mục
                </label>
                <select
                  {...register("categoryId")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-3">
                  Tóm tắt
                </label>
                <textarea
                  {...register("excerpt")}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Nhập tóm tắt ngắn gọn về bài viết..."
                />
                {errors.excerpt && <p className="mt-2 text-sm text-red-600">{errors.excerpt.message}</p>}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Nội dung bài viết *</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <CKEditor data={content} onChange={handleContentChange} />
                </div>
                {errors.content && <p className="mt-2 text-sm text-red-600">{errors.content.message}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">* Các trường bắt buộc</div>

                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Đang lưu..." : "Lưu nháp"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xuất bản...
                      </>
                    ) : (
                      "Xuất bản"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
