# Blog2Z - Full Stack Application

Ứng dụng blog hiện đại được xây dựng với kiến trúc tách biệt giữa Frontend và Backend, hỗ trợ đầy đủ các tính năng của một nền tảng blog.

## 🏗️ Kiến trúc hệ thống

### Backend (Node.js + Express + MySQL + Sequelize)
- **API RESTful** với Express.js
- **Cơ sở dữ liệu** MySQL với Sequelize ORM
- **Xác thực** JWT-based với Access Token & Refresh Token
- **Bảo mật** Helmet, CORS, Rate limiting
- **Upload** Multer cho xử lý file upload
- **Email** Nodemailer cho reset password
- **Validation** Express-validator

### Frontend (Next.js + TypeScript + Tailwind CSS)
- **Framework** Next.js 14 với App Router
- **UI** Tailwind CSS + shadcn/ui components
- **State Management** React hooks + Context API
- **HTTP Client** Axios với interceptors
- **Form Handling** React Hook Form + Zod validation
- **Rich Text Editor** CKEditor 5
- **Image Processing** React Image Crop

## 🚀 Tính năng chính

### 🔐 Xác thực & Bảo mật
- ✅ Đăng ký, đăng nhập với validation
- ✅ Access Token (15 phút) & Refresh Token (7 ngày)
- ✅ Tự động refresh token khi hết hạn
- ✅ Quên mật khẩu & reset qua email
- ✅ Đổi mật khẩu trong profile
- ✅ Logout từ tất cả thiết bị
- ✅ Device management & token rotation

### 👤 Quản lý người dùng
- ✅ Profile cá nhân với avatar upload
- ✅ Xem profile người dùng khác
- ✅ Follow/Unfollow người dùng
- ✅ Thống kê followers/following
- ✅ Role-based access (User/Admin)

### 📝 Quản lý bài viết
- ✅ Tạo, sửa, xóa bài viết với Rich Text Editor
- ✅ Upload ảnh đại diện cho bài viết
- ✅ Phân loại bài viết theo categories
- ✅ Xuất bản/ẩn bài viết
- ✅ SEO-friendly URLs (slug)
- ✅ Đếm lượt xem tự động
- ✅ Tìm kiếm bài viết với debounce

### 🏠 Trang chủ & Navigation
- ✅ **Infinite Scroll** - Cuộn vô hạn tự động tải thêm
- ✅ Filter theo "Tất cả" hoặc "Đang theo dõi"
- ✅ Sắp xếp theo "Mới nhất" hoặc "Nổi bật"
- ✅ Navigation với About & Contact pages
- ✅ Responsive design cho mobile

### 💬 Tương tác xã hội
- ✅ Like/Unlike bài viết
- ✅ Bình luận và trả lời bình luận (nested comments)
- ✅ Sửa, xóa bình luận của mình
- ✅ Đếm số lượng likes và comments

### 🎯 Khám phá nội dung
- ✅ **Bài viết liên quan** trong trang chi tiết
- ✅ Danh sách theo categories
- ✅ Tìm kiếm với filters
- ✅ Phân trang cho tất cả danh sách

### 🛠️ Admin Dashboard
- ✅ Quản lý người dùng (view, activate/deactivate)
- ✅ Quản lý bài viết (view, edit, delete)
- ✅ Quản lý categories (CRUD)
- ✅ Thống kê tổng quan
- ✅ Phân quyền admin

### 🎨 Giao diện & UX
- ✅ Responsive design cho mọi thiết bị
- ✅ Loading states & indicators
- ✅ Error handling với toast notifications
- ✅ Image cropping cho avatar
- ✅ Smooth animations & transitions

## 📁 Cấu trúc dự án

\`\`\`
personal-blog/
├── backend/                    # Backend API Server
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # Database configuration
│   │   ├── controllers/        # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── postController.js
│   │   │   ├── commentController.js
│   │   │   ├── userController.js
│   │   │   ├── categoryController.js
│   │   │   ├── followController.js
│   │   │   ├── adminController.js
│   │   │   └── uploadController.js
│   │   ├── middleware/          # Custom middleware
│   │   │   ├── auth.js         # JWT authentication
│   │   │   ├── admin.js        # Admin authorization
│   │   │   └── upload.js       # File upload handling
│   │   ├── models/             # Sequelize models
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── Comment.js
│   │   │   ├── Like.js
│   │   │   ├── Category.js
│   │   │   ├── Follow.js
│   │   │   ├── RefreshToken.js
│   │   │   ├── PasswordReset.js
│   │   │   └── index.js        # Model associations
│   │   ├── routes/             # API routes
│   │   │   ├── auth.js
│   │   │   ├── posts.js
│   │   │   ├── comments.js
│   │   │   ├── users.js
│   │   │   ├── categories.js
│   │   │   ├── follow.js
│   │   │   ├── admin.js
│   │   │   └── upload.js
│   │   └── services/
│   │       └── emailService.js # Email service
│   ├── uploads/                # File uploads directory
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Entry point
├── frontend/                   # Frontend Next.js App
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── forgot-password/
│   │   │   │   └── reset-password/
│   │   │   ├── admin/         # Admin dashboard
│   │   │   │   ├── users/
│   │   │   │   ├── posts/
│   │   │   │   └── categories/
│   │   │   ├── posts/         # Post pages
│   │   │   ├── users/         # User profiles
│   │   │   ├── categories/    # Category pages
│   │   │   ├── search/        # Search page
│   │   │   ├── about/         # About page
│   │   │   ├── contact/       # Contact page
│   │   │   ├── create-post/   # Create post
│   │   │   ├── edit-post/     # Edit post
│   │   │   ├── dashboard/     # User dashboard
│   │   │   ├── profile/       # User profile
│   │   │   ├── layout.tsx     # Root layout
│   │   │   ├── page.tsx       # Home page
│   │   │   └── globals.css    # Global styles
│   │   ├── components/        # React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Header.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   ├── RelatedPosts.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── AvatarUpload.tsx
│   │   │   ├── FeaturedImageUpload.tsx
│   │   │   ├── ImageCropper.tsx
│   │   │   ├── CKEditor.tsx
│   │   │   ├── LoadingButton.tsx
│   │   │   └── LoadingLink.tsx
│   │   ├── contexts/          # React contexts
│   │   │   └── LoadingContext.tsx
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePosts.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useInfiniteScroll.ts
│   │   │   └── useNavigationLoading.ts
│   │   ├── services/          # API services
│   │   │   ├── api.ts         # Axios configuration
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   ├── comments.ts
│   │   │   ├── users.ts
│   │   │   ├── categories.ts
│   │   │   ├── follow.ts
│   │   │   ├── admin.ts
│   │   │   └── upload.ts
│   │   ├── types/             # TypeScript types
│   │   │   └── index.ts
│   │   └── lib/
│   │       └── utils.ts       # Utility functions
│   ├── public/                # Static assets
│   ├── .env.example
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
└── scripts/                   # Database scripts
    ├── init-database.sql      # Complete database setup
    ├── sample-data.sql        # Sample data insertion
    └── migrations/            # Database migrations
\`\`\`

## 🛠️ Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+ 
- MySQL 8.0+
- npm hoặc yarn

### 1. Clone repository
\`\`\`bash
git clone <repository-url>
cd personal-blog
\`\`\`

### 2. Cài đặt Backend
\`\`\`bash
cd backend
npm install

# Cấu hình environment
cp .env.example .env
# Chỉnh sửa file .env với thông tin database và email
\`\`\`

### 3. Cài đặt Frontend
\`\`\`bash
cd frontend
npm install

# Cấu hình environment
cp .env.example .env.local
# Chỉnh sửa file .env.local nếu cần
\`\`\`

### 4. Tạo Database
\`\`\`bash
# Tạo database và bảng
mysql -u root -p < scripts/init-db.sql
\`\`\`

### 5. Chạy ứng dụng
\`\`\`bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev
\`\`\`

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## 🔧 Cấu hình Environment

### Backend (.env)
\`\`\`env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=personal_blog
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
\`\`\`

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Personal Blog
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

## 📊 Database Schema

### Bảng chính
- **users**: Thông tin người dùng, role, profile
- **posts**: Bài viết với content, category, stats
- **comments**: Bình luận có thể nested (parent-child)
- **categories**: Phân loại bài viết
- **likes**: Like bài viết (unique per user-post)
- **follows**: Quan hệ follow giữa users
- **refresh_tokens**: Quản lý refresh tokens
- **password_resets**: Token reset password

### Quan hệ
- User 1-n Posts (author)
- User 1-n Comments (author)  
- Post 1-n Comments
- User n-n Posts (likes)
- User n-n Users (follows)
- Category 1-n Posts
- Comment 1-n Comments (replies)

## 🔐 API Documentation

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/logout-all` - Đăng xuất tất cả thiết bị
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Posts
- `GET /api/posts` - Danh sách bài viết (có phân trang, filter)
- `GET /api/posts/following` - Bài viết từ người theo dõi
- `GET /api/posts/:slug` - Chi tiết bài viết
- `GET /api/posts/:id/related` - Bài viết liên quan
- `POST /api/posts` - Tạo bài viết mới
- `PUT /api/posts/:id` - Cập nhật bài viết
- `DELETE /api/posts/:id` - Xóa bài viết
- `POST /api/posts/:id/like` - Like/Unlike bài viết

### Comments
- `GET /api/comments/post/:postId` - Bình luận của bài viết
- `POST /api/comments` - Tạo bình luận
- `PUT /api/comments/:id` - Cập nhật bình luận
- `DELETE /api/comments/:id` - Xóa bình luận

### Users & Follow
- `GET /api/users/:username` - Thông tin user
- `GET /api/users/:username/posts` - Bài viết của user
- `POST /api/follow/:userId` - Follow/Unfollow user
- `GET /api/follow/:userId/followers` - Danh sách followers
- `GET /api/follow/:userId/following` - Danh sách following

### Categories
- `GET /api/categories` - Danh sách categories
- `GET /api/categories/:slug` - Chi tiết category
- `GET /api/categories/:slug/posts` - Bài viết theo category
- `POST /api/categories` - Tạo category (admin)
- `PUT /api/categories/:id` - Cập nhật category (admin)
- `DELETE /api/categories/:id` - Xóa category (admin)

### Upload
- `POST /api/upload/avatar` - Upload avatar
- `POST /api/upload/featured-image` - Upload ảnh bài viết

### Admin
- `GET /api/admin/stats` - Thống kê tổng quan
- `GET /api/admin/users` - Quản lý users
- `PUT /api/admin/users/:id/toggle-active` - Kích hoạt/vô hiệu hóa user
- `GET /api/admin/posts` - Quản lý posts
- `DELETE /api/admin/posts/:id` - Xóa post (admin)

