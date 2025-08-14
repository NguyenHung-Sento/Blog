"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { authService } from "@/services/auth"
import LoadingButton from "@/components/LoadingButton"
import LoadingLink from "@/components/LoadingLink"
import toast from "react-hot-toast"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      toast.error("Token không hợp lệ")
      router.push("/forgot-password")
      return
    }
    setToken(tokenParam)
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin")
      return
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setSuccess(true)
      toast.success("Đặt lại mật khẩu thành công!")
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast.error(error.response?.data?.error || "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Đặt lại mật khẩu thành công!</h2>
              <p className="text-gray-600 mb-6">
                Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.
              </p>
              <LoadingLink
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                loadingText="Đang chuyển đến trang đăng nhập..."
              >
                Đăng nhập ngay
              </LoadingLink>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
          <p className="mt-2 text-sm text-gray-600">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nhập mật khẩu mới"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {password && password.length < 6 && (
                <p className="mt-1 text-sm text-red-600">Mật khẩu phải có ít nhất 6 ký tự</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Mật khẩu xác nhận không khớp</p>
              )}
            </div>

            <div>
              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Đang cập nhật mật khẩu..."
                disabled={!password || !confirmPassword || password !== confirmPassword || password.length < 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đặt lại mật khẩu
              </LoadingButton>
            </div>

            <div className="text-center">
              <LoadingLink
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
                loadingText="Đang quay lại..."
              >
                Quay lại đăng nhập
              </LoadingLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
