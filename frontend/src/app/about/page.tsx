import { Users, Target, Heart, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Về Blog2Z</h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Nền tảng blog cá nhân hiện đại, nơi bạn có thể chia sẻ câu chuyện, kiến thức và kết nối với cộng đồng yêu
              thích viết lách.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Sứ mệnh của chúng tôi</h2>
              <p className="text-lg text-gray-600 mb-6">
                Blog2Z được tạo ra với mục tiêu xây dựng một cộng đồng viết lách tích cực, nơi mọi người có thể tự do
                chia sẻ những suy nghĩ, trải nghiệm và kiến thức của mình.
              </p>
              <p className="text-lg text-gray-600">
                Chúng tôi tin rằng mỗi người đều có những câu chuyện đáng kể, và Blog2Z là nơi để những câu chuyện đó
                được lắng nghe và truyền cảm hứng.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Cộng đồng</h3>
                  <p className="text-sm text-gray-600 mt-2">Kết nối với những người cùng đam mê</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Mục tiêu</h3>
                  <p className="text-sm text-gray-600 mt-2">Phát triển kỹ năng viết và tư duy</p>
                </div>
                <div className="text-center">
                  <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Đam mê</h3>
                  <p className="text-sm text-gray-600 mt-2">Yêu thích việc chia sẻ và học hỏi</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Chất lượng</h3>
                  <p className="text-sm text-gray-600 mt-2">Nội dung chất lượng và ý nghĩa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Tính năng nổi bật</h2>
            <p className="mt-4 text-lg text-gray-600">Những công cụ và tính năng giúp bạn viết blog hiệu quả</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Trình soạn thảo mạnh mẽ</h3>
                <p className="text-gray-600">
                  Trình soạn thảo WYSIWYG với đầy đủ tính năng định dạng, chèn hình ảnh và tạo nội dung phong phú.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Quản lý danh mục</h3>
                <p className="text-gray-600">
                  Tổ chức bài viết theo danh mục, giúp người đọc dễ dàng tìm kiếm nội dung theo chủ đề yêu thích.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Tương tác cộng đồng</h3>
                <p className="text-gray-600">
                  Hệ thống bình luận, like và follow giúp xây dựng cộng đồng tương tác tích cực.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Tìm kiếm thông minh</h3>
                <p className="text-gray-600">
                  Công cụ tìm kiếm mạnh mẽ giúp khám phá nội dung theo từ khóa, tác giả hoặc danh mục.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Responsive Design</h3>
                <p className="text-gray-600">Giao diện thân thiện trên mọi thiết bị, từ desktop đến mobile.</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-indigo-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Bảo mật cao</h3>
                <p className="text-gray-600">
                  Hệ thống bảo mật nhiều lớp, bảo vệ thông tin và nội dung của người dùng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Đội ngũ phát triển</h2>
            <p className="mt-4 text-lg text-gray-600">Những người đam mê công nghệ và viết lách</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Blog2Z Team</h3>
              <p className="text-lg text-gray-600 mb-6">
                Chúng tôi là một nhóm các developer và content creator đam mê, luôn nỗ lực để mang đến trải nghiệm tốt
                nhất cho cộng đồng blogger.
              </p>
              <p className="text-gray-600">
                Với kinh nghiệm trong lĩnh vực phát triển web và hiểu biết sâu sắc về nhu cầu của người viết blog, chúng
                tôi không ngừng cải tiến và phát triển Blog2Z để trở thành nền tảng blog tốt nhất.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Sẵn sàng bắt đầu hành trình viết blog?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Tham gia cộng đồng Blog2Z ngay hôm nay và chia sẻ câu chuyện của bạn
          </p>
          <div className="space-x-4">
            <a
              href="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Đăng ký ngay
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors"
            >
              Liên hệ với chúng tôi
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
