"use client"

import type React from "react"

import { useState } from "react"
import { Mail, ArrowLeft } from "lucide-react"
import { authService } from "@/services/auth"
import LoadingButton from "@/components/LoadingButton"
import LoadingLink from "@/components/LoadingLink"
import toast from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Vui lòng nhập email")
      return
    }

    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
      toast.success("Đã gửi link đặt lại mật khẩu đến email của bạn")
    } catch (error: any) {
      console.error("Forgot password error:", error)
      toast.error(error.response?.data?.error || "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <Mail className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Email đã được gửi!</h2>
              <p className="text-gray-600 mb-6">
                Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>. Vui lòng kiểm tra hộp thư và
                làm theo hướng dẫn.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Không thấy email? Kiểm tra thư mục spam hoặc thử lại sau vài phút.
              </p>
              <div className="space-y-3">
                <LoadingLink
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  loadingText="Đang chuyển đến trang đăng nhập..."
                >
                  Quay lại đăng nhập
                </LoadingLink>
                <button
                  onClick={() => setSent(false)}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Gửi lại email
                </button>
              </div>
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
          <h2 className="text-3xl font-bold text-gray-900">Quên mật khẩu?</h2>
          <p className="mt-2 text-sm text-gray-600">Nhập email của bạn để nhận link đặt lại mật khẩu</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nhập email của bạn"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Đang gửi email..."
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Gửi link đặt lại mật khẩu
              </LoadingButton>
            </div>

            <div className="text-center">
              <LoadingLink
                href="/login"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                loadingText="Đang quay lại..."
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại đăng nhập
              </LoadingLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
