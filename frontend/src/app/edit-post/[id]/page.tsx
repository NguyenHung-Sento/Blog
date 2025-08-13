"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { postsService, type Post } from "@/services/posts"
import { categoriesService, type Category } from "@/services/categories"
import { authService } from "@/services/auth"
import { Loader2, Save, Eye, ArrowLeft, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"

const postSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự").max(255, "Tiêu đề không được quá 255 ký tự"),
  content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự").max(50000, "Nội dung không được quá 50000 ký tự"),
  excerpt: z.string().max(500, "Tóm tắt không được quá 500 ký tự").optional(),
  categoryId: z.string().optional(),
  published: z.boolean().default(false),
})

type PostForm = z.infer<typeof postSchema>

export default function EditPostPage() {
  const params = useParams()
  const postId = Number.parseInt(params.id as string)
  const router = useRouter()

  const [post, setPost] = useState<Post | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentUser = authService.getCurrentUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
  })

  const watchedContent = watch("content")
  const watchedTitle = watch("title")

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
      return
    }
    loadPost()
    loadCategories()
  }, [postId])

  const loadPost = async () => {
    try {
      setLoading(true)
      // Lấy bài viết từ danh sách bài viết của user
      const userPosts = await postsService.getUserPosts(1, 100)
      const foundPost = userPosts.posts.find((p) => p.id === postId)

      if (!foundPost) {
        toast.error("Bài viết không tồn tại hoặc bạn không có quyền chỉnh sửa")
        router.push("/dashboard")
        return
      }

      setPost(foundPost)
      reset({
        title: foundPost.title,
        content: foundPost.content,
        excerpt: foundPost.excerpt || "",
        categoryId: foundPost.category?.id.toString() || "",
        published: foundPost.published,
      })
    } catch (error) {
      console.error("Error loading post:", error)
      toast.error("Không thể tải bài viết")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getAllCategories()
      setCategories(response.categories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const onSubmit = async (data: PostForm) => {
    if (!post) return

    setIsSubmitting(true)
    try {
      const postData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        published: data.published,
        categoryId: data.categoryId ? Number.parseInt(data.categoryId) : undefined,
      }

      const updatedPost = await postsService.updatePost(post.id, postData)
      toast.success(data.published ? "Bài viết đã được cập nhật và xuất bản!" : "Bài viết đã được cập nhật!")
      router.push(`/posts/${updatedPost.slug}`)
    } catch (error: any) {
      console.error("Update post error:", error)
      const message = error.response?.data?.error || "Có lỗi xảy ra khi cập nhật bài viết"
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

  const handleDelete = async () => {
    if (!post) return

    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.")) {
      return
    }

    setIsDeleting(true)
    try {
      await postsService.deletePost(post.id)
      toast.success("Bài viết đã được xóa")
      router.push("/dashboard")
    } catch (error) {
      console.error("Delete post error:", error)
      toast.error("Có lỗi xảy ra khi xóa bài viết")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để chỉnh sửa bài viết</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bài viết không tồn tại</p>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Về Dashboard
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
              Quay lại Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa bài viết</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? "Chỉnh sửa" : "Xem trước"}
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {isPreview ? (
            /* Preview Mode */
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">{watchedTitle || post.title}</h1>
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: (watchedContent || post.content).replace(/\n/g, "<br>"),
                }}
              />
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề bài viết *
                </label>
                <input
                  {...register("title")}
                  type="text"
                  className="w-full px-4 py-3 text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề bài viết..."
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select
                  {...register("categoryId")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Tóm tắt
                </label>
                <textarea
                  {...register("excerpt")}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Nhập tóm tắt ngắn gọn về bài viết..."
                />
                {errors.excerpt && <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>}
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung bài viết *
                </label>
                <textarea
                  {...register("content")}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Viết nội dung bài viết của bạn ở đây..."
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">* Các trường bắt buộc</div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Đang lưu..." : "Lưu nháp"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      "Cập nhật"
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
