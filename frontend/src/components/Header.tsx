"use client"

import { useState, useEffect } from "react"
import { User, PenTool, LogOut, Menu, X, Search, Settings, LayoutDashboard, Shield } from "lucide-react"
import { authService } from "@/services/auth"
import type { User as UserType } from "@/services/auth"
import LoadingLink from "./LoadingLink"
import { useNavigationLoading } from "@/hooks/useNavigationLoading"

export default function Header() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { startNavigation } = useNavigationLoading()

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }

    checkAuth()

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") {
        checkAuth()
      }
    }

    // Listen for custom auth events
    const handleAuthChange = () => {
      checkAuth()
    }

    // Listen for focus events (when user comes back to tab)
    const handleFocus = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("authChange", handleAuthChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("authChange", handleAuthChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  const handleLogout = () => {
    startNavigation("Đang đăng xuất...")
    authService.logout()
    setUser(null)
    setIsMenuOpen(false)
    // Force reload to clear any cached data
    window.location.href = "/"
  }

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <LoadingLink
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              loadingText="Đang về trang chủ..."
            >
              Blog2Z
            </LoadingLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <LoadingLink
              href="/"
              className="text-gray-700 hover:text-gray-900 transition-colors"
              loadingText="Đang tải trang chủ..."
            >
              Trang chủ
            </LoadingLink>
            <LoadingLink
              href="/categories"
              className="text-gray-700 hover:text-gray-900 transition-colors"
              loadingText="Đang tải danh mục..."
            >
              Danh mục
            </LoadingLink>
            <LoadingLink
              href="/search"
              className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
              loadingText="Đang mở tìm kiếm..."
            >
              <Search className="w-4 h-4 mr-1" />
              Tìm kiếm
            </LoadingLink>
            {user ? (
              <>
                <LoadingLink
                  href="/create-post"
                  className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                  loadingText="Đang mở trình soạn thảo..."
                >
                  <PenTool className="w-4 h-4 mr-1" />
                  Viết bài
                </LoadingLink>
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                    <User className="w-4 h-4 mr-1" />
                    {user.fullName}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <LoadingLink
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      loadingText="Đang tải dashboard..."
                    >
                      <LayoutDashboard className="w-4 h-4 inline mr-2" />
                      Dashboard
                    </LoadingLink>
                    <LoadingLink
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      loadingText="Đang tải cài đặt..."
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Cài đặt
                    </LoadingLink>
                    {user.role === "admin" && (
                      <LoadingLink
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        loadingText="Đang tải trang quản trị..."
                      >
                        <Shield className="w-4 h-4 inline mr-2" />
                        Quản trị
                      </LoadingLink>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <LoadingLink
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  loadingText="Đang mở trang đăng nhập..."
                >
                  Đăng nhập
                </LoadingLink>
                <LoadingLink
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  loadingText="Đang mở trang đăng ký..."
                >
                  Đăng ký
                </LoadingLink>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t bg-white">
              <LoadingLink
                href="/"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
                loadingText="Đang tải trang chủ..."
              >
                Trang chủ
              </LoadingLink>
              <LoadingLink
                href="/categories"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
                loadingText="Đang tải danh mục..."
              >
                Danh mục
              </LoadingLink>
              <LoadingLink
                href="/search"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
                loadingText="Đang mở tìm kiếm..."
              >
                Tìm kiếm
              </LoadingLink>
              {user ? (
                <>
                  <LoadingLink
                    href="/create-post"
                    className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    loadingText="Đang mở trình soạn thảo..."
                  >
                    Viết bài
                  </LoadingLink>
                  <LoadingLink
                    href="/dashboard"
                    className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    loadingText="Đang tải dashboard..."
                  >
                    <LayoutDashboard className="w-4 h-4 inline mr-2" />
                    Dashboard
                  </LoadingLink>
                  <LoadingLink
                    href="/profile"
                    className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    loadingText="Đang tải cài đặt..."
                  >
                    Cài đặt
                  </LoadingLink>
                  {user.role === "admin" && (
                    <LoadingLink
                      href="/admin"
                      className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                      loadingText="Đang tải trang quản trị..."
                    >
                      <Shield className="w-4 h-4 inline mr-2" />
                      Quản trị
                    </LoadingLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <LoadingLink
                    href="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    loadingText="Đang mở trang đăng nhập..."
                  >
                    Đăng nhập
                  </LoadingLink>
                  <LoadingLink
                    href="/register"
                    className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    loadingText="Đang mở trang đăng ký..."
                  >
                    Đăng ký
                  </LoadingLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
