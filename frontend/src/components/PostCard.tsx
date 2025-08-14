"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageCircle, User, Eye, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { postsService, type Post } from "@/services/posts"
import { authService } from "@/services/auth"
import { uploadService } from "@/services/upload"
import CategoryBadge from "./CategoryBadge"
import LoadingLink from "./LoadingLink"
import LoadingButton from "./LoadingButton"
import toast from "react-hot-toast"

interface PostCardProps {
  post: Post & {
    category?: {
      id: number
      name: string
      slug: string
      color: string
    }
  }
  onLikeUpdate?: (postId: number, liked: boolean) => void
}

export default function PostCard({ post, onLikeUpdate }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes || [])
  const [isLiking, setIsLiking] = useState(false)

  const currentUser = authService.getCurrentUser()
  const isLiked = currentUser ? likes.some((like) => like.userId === currentUser.id) : false

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để thích bài viết")
      return
    }

    if (isLiking) return

    setIsLiking(true)
    try {
      const response = await postsService.toggleLike(post.id)

      if (response.liked) {
        setLikes([...likes, { userId: currentUser.id }])
        toast.success("Đã thích bài viết")
      } else {
        setLikes(likes.filter((like) => like.userId !== currentUser.id))
        toast.success("Đã bỏ thích bài viết")
      }

      onLikeUpdate?.(post.id, response.liked)
    } catch (error) {
      console.error("Like error:", error)
      toast.error("Có lỗi xảy ra khi thích bài viết")
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
      {post.featuredImage && (
        <div className="aspect-video relative">
          <LoadingLink href={`/posts/${post.slug}`} loadingText="Đang tải bài viết...">
            <Image
              src={uploadService.getImageUrl(post.featuredImage) || "/placeholder.svg?height=240&width=400"}
              alt={post.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </LoadingLink>
          {post.category && (
            <div className="absolute top-4 left-4">
              <CategoryBadge category={post.category} />
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {post.author.avatar ? (
              <Image
                src={uploadService.getImageUrl(post.author.avatar) || "/placeholder.svg?height=40&width=40"}
                alt={post.author.fullName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
            <div className="ml-3">
              <LoadingLink
                href={`/users/${post.author.username}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                loadingText="Đang tải trang cá nhân..."
              >
                {post.author.fullName}
              </LoadingLink>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </div>
            </div>
          </div>
        </div>

        {!post.featuredImage && post.category && (
          <div className="mb-3">
            <CategoryBadge category={post.category} />
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          <LoadingLink
            href={`/posts/${post.slug}`}
            className="hover:text-blue-600 transition-colors"
            loadingText="Đang tải bài viết..."
          >
            {post.title}
          </LoadingLink>
        </h2>

        {post.excerpt && <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LoadingButton
              onClick={handleLike}
              disabled={!currentUser}
              loading={isLiking}
              loadingText="Đang xử lý..."
              variant="secondary"
              size="sm"
              className={`!p-2 !bg-transparent !text-gray-500 hover:!text-red-500 hover:!bg-red-50 ${
                isLiked ? "!text-red-500" : ""
              } ${!currentUser ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              <span className="ml-1 text-sm">{likes.length}</span>
            </LoadingButton>

            <LoadingLink
              href={`/posts/${post.slug}#comments`}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors p-2 rounded-md hover:bg-blue-50"
              loadingText="Đang tải bình luận..."
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments?.length || 0}</span>
            </LoadingLink>

            <div className="flex items-center space-x-1 text-gray-500 p-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm">{post.viewCount}</span>
            </div>
          </div>

          <LoadingLink
            href={`/posts/${post.slug}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
            loadingText="Đang tải bài viết..."
          >
            Đọc thêm →
          </LoadingLink>
        </div>
      </div>
    </article>
  )
}
