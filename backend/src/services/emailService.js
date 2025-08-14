const nodemailer = require("nodemailer")

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

  const mailOptions = {
    from: `"Blog2Z" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Đặt lại mật khẩu - Blog2Z",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Blog2Z</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">Đặt lại mật khẩu</h2>
          <p style="color: #475569; line-height: 1.6;">
            Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
            Nhấp vào nút bên dưới để tạo mật khẩu mới:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Đặt lại mật khẩu
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
            Liên kết này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, 
            vui lòng bỏ qua email này.
          </p>
        </div>
        
        <div style="text-align: center; color: #94a3b8; font-size: 12px;">
          <p>© 2024 Blog2Z. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Send email error:", error)
    return false
  }
}

module.exports = {
  sendPasswordResetEmail,
}
