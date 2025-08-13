"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { postsService, type Post } from "@/services/posts"
import { followService } from "@/services/follow"
import { authService } from "@/services/auth"
import PostCard from "@/components/PostCard"
import { User, Calendar, FileText, Eye, Heart, ArrowLeft, Loader2, UserPlus, UserMinus, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import toast from "react-hot-toast"

interface UserProfile {
  id: number
  username: string
  fullName: string
  avatar?: string
  bio?: string
  postCount: number
  createdAt: string
}

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string

  const [user, setUser] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalPosts: 0,
    hasNext: false,
    hasPrev: false,
  })

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    if (username) {
      loadUserProfile()
      loadUserPosts()
      if (currentUser) {
        checkFollowStatus()
      }
      loadFollowStats()
    }
  }, [username])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      // Mock API call - replace with actual API
      const mockUser: UserProfile = {
        id: 1,
        username: username,
        fullName: "Người dùng mẫu",
        bio: "Đây là tiểu sử của người dùng. Tôi yêu thích viết blog về công nghệ và cuộc sống.",
        postCount: 5,
        createdAt: "2023-01-01T00:00:00Z",
        avatar: "/placeholder.svg?height=120&width=120",
      }
      setUser(mockUser)
      setError(null)
    } catch (err) {
      console.error("Error loading user profile:", err)
      setError("Không thể tải thông tin người dùng")
    } finally {
      setLoading(false)
    }
  }

  const loadUserPosts = async (page = 1) => {
    try {
      setPostsLoading(true)
      // Load posts with author matching username
      const response = await postsService.getAllPosts(page, 6)

      // Filter posts by username (in real app, this would be done on backend)
      const userPosts = response.posts.filter((post) => post.author.username === username)

      setPosts(userPosts)
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(userPosts.length / 6),
        totalPosts: userPosts.length,
        hasNext: userPosts.length > page * 6,
        hasPrev: page > 1,
      })
    } catch (err) {
      console.error("Error loading user posts:", err)
    } finally {
      setPostsLoading(false)
    }
  }

  const checkFollowStatus = async () => {
    if (!user || !currentUser) return

    try {
      const result = await followService.checkFollowStatus(user.id)
      setIsFollowing(result.following)
    } catch (error) {
      console.error("Error checking follow status:", error)
    }
  }

  const loadFollowStats = async () => {
    if (!user) return

    try {
      const [followersRes, followingRes] = await Promise.all([
        followService.getFollowers(user.id, 1, 1),
        followService.getFollowing(user.id, 1, 1),
      ])

      setFollowStats({
        followers: followersRes.pagination.totalFollowers,
        following: followingRes.pagination.totalFollowing,
      })
    } catch (error) {
      console.error("Error loading follow stats:", error)
    }
  }

  const handleFollowToggle = async () => {
    if (!currentUser || !user) {
      toast.error("Vui lòng đăng nhập để theo dõi")
      return
    }

    if (currentUser.id === user.id) {
      toast.error("Không thể theo dõi chính mình")
      return
    }

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await followService.unfollowUser(user.id)
        setIsFollowing(false)
        setFollowStats((prev) => ({ ...prev, followers: prev.followers - 1 }))
        toast.success("Đã bỏ theo dõi")
      } else {
        await followService.followUser(user.id)
        setIsFollowing(true)
        setFollowStats((prev) => ({ ...prev, followers: prev.followers + 1 }))
        toast.success("Đã theo dõi")
      }
    } catch (error) {
      console.error("Follow toggle error:", error)
      toast.error("Có lỗi xảy ra")
    } finally {
      setFollowLoading(false)
    }
  }

  const handleLikeUpdate = (postId: number, liked: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id
          if (liked) {
            return {
              ...post,
              likes: [...post.likes, { userId: currentUserId }],
            }
          } else {
            return {
              ...post,
              likes: post.likes.filter((like) => like.userId !== currentUserId),
            }
          }
        }
        return post
      }),
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">{error || "Người dùng không tồn tại"}</p>
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Về trang chủ
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0)
  const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0)
  const isOwnProfile = currentUser?.username === username

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {user.avatar ? (
                  <Image
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.fullName}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-30 h-30 bg-white rounded-full flex items-center justify-center border-4 border-white">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <div className="ml-6 text-white">
                  <h1 className="text-3xl font-bold">{user.fullName}</h1>
                  <p className="text-blue-100 text-lg">@{user.username}</p>
                  <div className="flex items-center mt-2 text-blue-100">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      Tham gia{" "}
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>

                  {/* Follow Stats */}
                  <div className="flex items-center space-x-4 mt-3 text-blue-100">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">{followStats.followers} người theo dõi</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm">{followStats.following} đang theo dõi</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              {currentUser && !isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 ${
                    isFollowing
                      ? "bg-gray-600 text-white hover:bg-gray-700"
                      : "bg-white text-blue-600 hover:bg-gray-100"
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isFollowing ? (
                    <UserMinus className="w-4 h-4 mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {followLoading ? "Đang xử lý..." : isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Bio */}
            {user.bio && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Giới thiệu</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                <div className="text-sm text-gray-500">Bài viết</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalViews}</div>
                <div className="text-sm text-gray-500">Lượt xem</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalLikes}</div>
                <div className="text-sm text-gray-500">Lượt thích</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{followStats.followers}</div>
                <div className="text-sm text-gray-500">Người theo dõi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Bài viết của {user.fullName} ({posts.length})
            </h2>
          </div>

          <div className="p-6">
            {postsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onLikeUpdate={handleLikeUpdate} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">{user.fullName} chưa có bài viết nào.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
