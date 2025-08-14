"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { postsService, type Post } from "@/services/posts"
import { uploadService } from "@/services/upload"
import CategoryBadge from "./CategoryBadge"
import { Loader2, Eye, Heart, MessageCircle, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface RelatedPostsProps {
  postId: number
}

export default function RelatedPosts({ postId }: RelatedPostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRelatedPosts()
  }, [postId])

  const loadRelatedPosts = async () => {
    try {
      setLoading(true)
      const relatedPosts = await postsService.getRelatedPosts(postId, 4)
      setPosts(relatedPosts)
    } catch (error) {
      console.error("Error loading related posts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Bài viết liên quan</h3>
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Bài viết liên quan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <article key={post.id} className="group">
            <Link href={`/posts/${post.slug}`} className="block">
              {/* Featured Image */}
              {post.featuredImage ? (
                <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={uploadService.getImageUrl(post.featuredImage) || "/placeholder.svg?height=200&width=400"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {post.category && (
                    <div className="absolute top-3 left-3">
                      <CategoryBadge category={post.category} size="sm" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video relative mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    {post.category && <CategoryBadge category={post.category} size="sm" />}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h4>

                {post.excerpt && <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>}

                {/* Author and Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    {post.author.avatar ? (
                      <Image
                        src={uploadService.getImageUrl(post.author.avatar) || "/placeholder.svg?height=24&width=24"}
                        alt={post.author.fullName}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-600" />
                      </div>
                    )}
                    <span className="ml-2 font-medium">{post.author.fullName}</span>
                  </div>
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Heart className="w-3 h-3 mr-1" />
                    <span>{post.likes.length}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    <span>{post.comments?.length || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    <span>{post.viewCount}</span>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
