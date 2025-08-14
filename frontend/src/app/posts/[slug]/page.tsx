"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { postsService, type Post } from "@/services/posts"
import { commentsService, type Comment } from "@/services/comments"
import { authService } from "@/services/auth"
import CategoryBadge from "@/components/CategoryBadge"
import CommentSection from "@/components/CommentSection"
import RelatedPosts from "@/components/RelatedPosts"
import { Loader2, Heart, MessageCircle, Eye, Calendar, User, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import toast from "react-hot-toast"
import { uploadService } from "@/services/upload"

export default function PostDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiking, setIsLiking] = useState(false)

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    if (slug) {
      loadPost()
    }
  }, [slug])

  useEffect(() => {
    if (post) {
      loadComments()
    }
  }, [post])

  const loadPost = async () => {
    try {
      setLoading(true)
      const postData = await postsService.getPostBySlug(slug)
      setPost(postData)
      setError(null)
    } catch (err: any) {
      console.error("Error loading post:", err)
      if (err.response?.status === 404) {
        setError("Bài viết không tồn tại")
      } else {
        setError("Không thể tải bài viết. Vui lòng thử lại.")
      }
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    if (!post) return

    try {
      setCommentsLoading(true)
      const response = await commentsService.getCommentsByPost(post.id)
      setComments(response.comments)
    } catch (err) {
      console.error("Error loading comments:", err)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!currentUser || !post) {
      toast.error("Vui lòng đăng nhập để thích bài viết")
      return
    }

    if (isLiking) return

    setIsLiking(true)
    try {
      const response = await postsService.toggleLike(post.id)

      setPost((prev) => {
        if (!prev) return prev

        if (response.liked) {
          return {
            ...prev,
            likes: [...prev.likes, { userId: currentUser.id }],
          }
        } else {
          return {
            ...prev,
            likes: prev.likes.filter((like) => like.userId !== currentUser.id),
          }
        }
      })

      toast.success(response.liked ? "Đã thích bài viết" : "Đã bỏ thích bài viết")
    } catch (error) {
      console.error("Like error:", error)
      toast.error("Có lỗi xảy ra khi thích bài viết")
    } finally {
      setIsLiking(false)
    }
  }

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev])
  }

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev) => prev.map((comment) => (comment.id === updatedComment.id ? updatedComment : comment)))
  }

  const handleCommentDeleted = (commentId: number) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">{error || "Bài viết không tồn tại"}</p>
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Về trang chủ
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const isLiked = currentUser ? post.likes.some((like) => like.userId === currentUser.id) : false

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
        </div>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="aspect-video relative">
              <Image
                src={uploadService.getImageUrl(post.featuredImage) || "/placeholder.svg?height=400&width=800"}
                alt={post.title}
                fill
                className="object-cover"
              />
              {post.category && (
                <div className="absolute top-6 left-6">
                  <CategoryBadge category={post.category} />
                </div>
              )}
            </div>
          )}

          <div className="p-8">
            {/* Category (if no featured image) */}
            {!post.featuredImage && post.category && (
              <div className="mb-4">
                <CategoryBadge category={post.category} />
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

            {/* Author and Meta */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center">
                {post.author.avatar ? (
                  <Image
                    src={uploadService.getImageUrl(post.author.avatar) || "/placeholder.svg?height=50&width=50"}
                    alt={post.author.fullName}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="ml-4">
                  <Link
                    href={`/users/${post.author.username}`}
                    className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {post.author.fullName}
                  </Link>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  disabled={!currentUser || isLiking}
                  className={`flex items-center space-x-2 transition-colors ${
                    isLiked ? "text-red-500" : "text-gray-500"
                  } hover:text-red-500 ${!currentUser ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                  <span>{post.likes.length}</span>
                </button>

                <div className="flex items-center space-x-2 text-gray-500">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length}</span>
                </div>

                <div className="flex items-center space-x-2 text-gray-500">
                  <Eye className="w-5 h-5" />
                  <span>{post.viewCount}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br>") }}
            />

            {/* Author Bio */}
            {post.author.bio && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Về tác giả</h3>
                <div className="flex items-start">
                  {post.author.avatar ? (
                    <Image
                      src={uploadService.getImageUrl(post.author.avatar) || "/placeholder.svg?height=60&width=60"}
                      alt={post.author.fullName}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-15 h-15 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">{post.author.fullName}</h4>
                    <p className="text-gray-600 mt-1">{post.author.bio}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <div id="comments" className="mt-8">
          <CommentSection
            postId={post.id}
            comments={comments}
            loading={commentsLoading}
            onCommentAdded={handleCommentAdded}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>

        {/* Related Posts Section */}
        <div className="mt-8">
          <RelatedPosts postId={post.id} />
        </div>
      </main>
    </div>
  )
}
