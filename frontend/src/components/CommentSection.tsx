"use client"

import { useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { commentsService, type Comment } from "@/services/comments"
import { authService } from "@/services/auth"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { User, MessageCircle, Edit2, Trash2, Reply, Send } from "lucide-react"
import toast from "react-hot-toast"
import { uploadService } from "@/services/upload"

const commentSchema = z.object({
  content: z.string().min(1, "Bình luận không được để trống").max(1000, "Bình luận không được quá 1000 ký tự"),
})

type CommentForm = z.infer<typeof commentSchema>

interface CommentSectionProps {
  postId: number
  comments: Comment[]
  loading: boolean
  onCommentAdded: (comment: Comment) => void
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (commentId: number) => void
}

interface CommentItemProps {
  comment: Comment
  postId: number
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (commentId: number) => void
  onReplyAdded: (reply: Comment) => void
}

function CommentItem({ comment, postId, onCommentUpdated, onCommentDeleted, onReplyAdded }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentUser = authService.getCurrentUser()
  const canEdit = currentUser?.id === comment.author.id
  const canDelete = currentUser?.id === comment.author.id

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
  } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: comment.content },
  })

  const {
    register: registerReply,
    handleSubmit: handleSubmitReply,
    formState: { errors: replyErrors },
    reset: resetReply,
  } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
  })

  const handleEdit = async (data: CommentForm) => {
    setIsSubmitting(true)
    try {
      const updatedComment = await commentsService.updateComment(comment.id, data.content)
      onCommentUpdated(updatedComment)
      setIsEditing(false)
      toast.success("Cập nhật bình luận thành công")
    } catch (error) {
      console.error("Update comment error:", error)
      toast.error("Có lỗi xảy ra khi cập nhật bình luận")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return

    try {
      await commentsService.deleteComment(comment.id)
      onCommentDeleted(comment.id)
      toast.success("Xóa bình luận thành công")
    } catch (error) {
      console.error("Delete comment error:", error)
      toast.error("Có lỗi xảy ra khi xóa bình luận")
    }
  }

  const handleReply = async (data: CommentForm) => {
    setIsSubmitting(true)
    try {
      const reply = await commentsService.createComment({
        content: data.content,
        postId,
        parentId: comment.id,
      })
      onReplyAdded(reply)
      setIsReplying(false)
      resetReply()
      toast.success("Trả lời thành công")
    } catch (error) {
      console.error("Reply comment error:", error)
      toast.error("Có lỗi xảy ra khi trả lời")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-l-2 border-gray-100 pl-4 ml-2">
      <div className="flex items-start space-x-3">
        {comment.author.avatar ? (
          <Image
            src={comment.author.avatar || "/placeholder.svg?height=40&width=40"}
            alt={comment.author.fullName}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        )}

        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium text-gray-900">{comment.author.fullName}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
              </div>

              {(canEdit || canDelete) && (
                <div className="flex items-center space-x-2">
                  {canEdit && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={handleDelete} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmitEdit(handleEdit)} className="space-y-3">
                <textarea
                  {...registerEdit("content")}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Nhập bình luận..."
                />
                {editErrors.content && <p className="text-sm text-red-600">{editErrors.content.message}</p>}
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      resetEdit()
                    }}
                    className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-gray-700">{comment.content}</p>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center space-x-4 mt-2">
              {currentUser && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span>Trả lời</span>
                </button>
              )}
            </div>
          )}

          {isReplying && (
            <form onSubmit={handleSubmitReply(handleReply)} className="mt-4 space-y-3">
              <textarea
                {...registerReply("content")}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Nhập trả lời..."
              />
              {replyErrors.content && <p className="text-sm text-red-600">{replyErrors.content.message}</p>}
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex items-center"
                >
                  <Send className="w-4 h-4 mr-1" />
                  {isSubmitting ? "Đang gửi..." : "Trả lời"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(false)
                    resetReply()
                  }}
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onCommentUpdated={onCommentUpdated}
                  onCommentDeleted={onCommentDeleted}
                  onReplyAdded={onReplyAdded}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentSection({
  postId,
  comments,
  loading,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
}: CommentSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentUser = authService.getCurrentUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
  })

  const onSubmit = async (data: CommentForm) => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để bình luận")
      return
    }

    setIsSubmitting(true)
    try {
      const comment = await commentsService.createComment({
        content: data.content,
        postId,
      })
      onCommentAdded(comment)
      reset()
      toast.success("Bình luận thành công")
    } catch (error) {
      console.error("Comment error:", error)
      toast.error("Có lỗi xảy ra khi bình luận")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReplyAdded = (reply: Comment) => {
    onCommentAdded(reply)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <MessageCircle className="w-6 h-6 text-gray-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">Bình luận ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
          <div className="flex items-start space-x-3">
            {currentUser.avatar ? (
              <Image
                src={uploadService.getImageUrl(currentUser.avatar) || "/placeholder.svg?height=40&width=40"}
                alt={currentUser.fullName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}

            <div className="flex-1">
              <textarea
                {...register("content")}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Nhập bình luận của bạn..."
              />
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Đang gửi..." : "Bình luận"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-3">Vui lòng đăng nhập để bình luận</p>
          <div className="space-x-3">
            <a
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Đăng nhập
            </a>
            <a
              href="/register"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Đăng ký
            </a>
          </div>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
        </div>
      )}
    </div>
  )
}
