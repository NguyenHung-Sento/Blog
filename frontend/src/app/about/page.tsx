"use client"

import Link from "next/link"
import { Heart, Code, Coffee, Users, Target, Lightbulb, ArrowLeft } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Về chúng tôi</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chào mừng đến với nền tảng blog cá nhân - nơi chia sẻ những câu chuyện, kiến thức và trải nghiệm của bạn với
            cộng đồng.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            {/* Mission Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Sứ mệnh của chúng tôi</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Chúng tôi tin rằng mỗi người đều có những câu chuyện đáng kể, những kiến thức quý báu và những trải
                nghiệm thú vị. Nền tảng blog này được tạo ra để giúp bạn chia sẻ tất cả những điều đó một cách dễ dàng
                và hiệu quả.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Mục tiêu của chúng tôi là xây dựng một cộng đồng nơi mọi người có thể học hỏi, chia sẻ và kết nối thông
                qua việc viết blog.
              </p>
            </div>

            {/* Features Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Lightbulb className="w-8 h-8 text-yellow-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Tính năng nổi bật</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Viết bài dễ dàng</h3>
                  <p className="text-gray-700">
                    Giao diện đơn giản, trực quan giúp bạn tập trung vào nội dung mà không bị phân tâm bởi các tính năng
                    phức tạp.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quản lý danh mục</h3>
                  <p className="text-gray-700">
                    Tổ chức bài viết theo chủ đề với hệ thống danh mục linh hoạt, giúp người đọc dễ dàng tìm kiếm nội
                    dung.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tương tác cộng đồng</h3>
                  <p className="text-gray-700">
                    Người đọc có thể thích, bình luận và chia sẻ bài viết, tạo nên những cuộc thảo luận bổ ích.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tìm kiếm thông minh</h3>
                  <p className="text-gray-700">
                    Hệ thống tìm kiếm mạnh mẽ giúp bạn dễ dàng khám phá những bài viết phù hợp với sở thích.
                  </p>
                </div>
              </div>
            </div>

            {/* Values Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Heart className="w-8 h-8 text-red-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Giá trị cốt lõi</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Đơn giản và Hiệu quả</h3>
                    <p className="text-gray-700">
                      Chúng tôi tin vào sức mạnh của sự đơn giản. Giao diện và tính năng được thiết kế để bạn có thể bắt
                      đầu viết ngay lập tức mà không cần học hỏi phức tạp.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cộng đồng và Kết nối</h3>
                    <p className="text-gray-700">
                      Chúng tôi xây dựng một môi trường tích cực nơi mọi người có thể chia sẻ, học hỏi và hỗ trợ lẫn
                      nhau thông qua việc viết blog.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chất lượng và Tự do</h3>
                    <p className="text-gray-700">
                      Chúng tôi tôn trọng quyền tự do sáng tạo và khuyến khích việc chia sẻ nội dung chất lượng cao, có
                      giá trị với cộng đồng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <Code className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Công nghệ sử dụng</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Nền tảng blog được xây dựng bằng các công nghệ hiện đại và đáng tin cậy:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Frontend</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Next.js 14 - Framework React hiện đại</li>
                  <li>• TypeScript - Đảm bảo tính ổn định và bảo trì</li>
                  <li>• Tailwind CSS - Thiết kế responsive đẹp mắt</li>
                  <li>• React Hook Form - Quản lý form hiệu quả</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Backend</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Node.js & Express - Server mạnh mẽ</li>
                  <li>• MySQL & Sequelize - Database ổn định</li>
                  <li>• JWT Authentication - Bảo mật tài khoản</li>
                  <li>• RESTful API - Kiến trúc chuẩn</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <Users className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Đội ngũ phát triển</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              Dự án được phát triển bởi một đội ngũ đam mê công nghệ và yêu thích việc chia sẻ kiến thức.
            </p>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
                <Users className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Đội ngũ phát triển</h3>
              <p className="text-gray-600 mb-4">
                Chúng tôi là những lập trình viên trẻ tuổi, luôn cố gắng mang đến những sản phẩm tốt nhất cho cộng đồng.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Coffee className="w-4 h-4 mr-1" />
                  Powered by coffee
                </span>
                <span className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  Made with love
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h2>
            <p className="text-gray-700 text-lg mb-6">
              Bạn có ý tưởng, góp ý hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng lắng nghe!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <a
                href="mailto:contact@myblog.com"
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Email: contact@myblog.com
              </a>
              <Link
                href="/contact"
                className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Gửi tin nhắn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
