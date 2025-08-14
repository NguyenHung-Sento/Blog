"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react"
import LoadingButton from "@/components/LoadingButton"
import toast from "react-hot-toast"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    setLoading(true)

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success("Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Liên hệ với chúng tôi</h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Có câu hỏi, góp ý hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng lắng nghe và giúp đỡ bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin liên hệ</h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-lg p-3 mr-4">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">support@blog2z.com</p>
                      <p className="text-gray-600">contact@blog2z.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-lg p-3 mr-4">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Điện thoại</h3>
                      <p className="text-gray-600">+84 123 456 789</p>
                      <p className="text-gray-600">+84 987 654 321</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-lg p-3 mr-4">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Địa chỉ</h3>
                      <p className="text-gray-600">
                        123 Đường ABC, Quận 1<br />
                        TP. Hồ Chí Minh, Việt Nam
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Giờ làm việc</h3>
                      <p className="text-gray-600">
                        Thứ 2 - Thứ 6: 9:00 - 18:00
                        <br />
                        Thứ 7: 9:00 - 12:00
                        <br />
                        Chủ nhật: Nghỉ
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Câu hỏi thường gặp</h3>
                  <div className="space-y-3">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        Làm sao để tạo tài khoản?
                        <MessageCircle className="w-4 h-4 group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-2 text-sm text-gray-600">
                        Bạn có thể đăng ký tài khoản miễn phí bằng cách click vào nút "Đăng ký" ở góc trên bên phải của
                        trang web.
                      </p>
                    </details>

                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        Blog2Z có miễn phí không?
                        <MessageCircle className="w-4 h-4 group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-2 text-sm text-gray-600">
                        Có, Blog2Z hoàn toàn miễn phí cho tất cả người dùng. Bạn có thể tạo và chia sẻ blog không giới
                        hạn.
                      </p>
                    </details>

                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        Làm sao để liên hệ hỗ trợ?
                        <MessageCircle className="w-4 h-4 group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-2 text-sm text-gray-600">
                        Bạn có thể gửi email cho chúng tôi hoặc sử dụng form liên hệ bên cạnh. Chúng tôi sẽ phản hồi
                        trong vòng 24 giờ.
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập họ và tên của bạn"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập email của bạn"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Chủ đề *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập chủ đề tin nhắn"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                    />
                  </div>

                  <div>
                    <LoadingButton
                      type="submit"
                      loading={loading}
                      loadingText="Đang gửi tin nhắn..."
                      className="w-full md:w-auto inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Gửi tin nhắn
                    </LoadingButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
