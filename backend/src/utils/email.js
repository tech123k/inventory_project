const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, purpose) => {
  const subject = purpose === 'signup' ? 'Verify Your Account - Inventory Pro' : 'Password Reset OTP - Inventory Pro';
  const action = purpose === 'signup' ? 'verify your account' : 'reset your password';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .header p { color: #93c5fd; margin: 5px 0 0; font-size: 14px; }
        .body { padding: 40px 30px; text-align: center; }
        .body p { color: #374151; font-size: 15px; line-height: 1.6; }
        .otp-box { display: inline-block; background: #f0f9ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 20px 40px; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: bold; color: #1e3a5f; letter-spacing: 8px; }
        .expiry { color: #6b7280; font-size: 13px; margin-top: 20px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Inventory Pro</h1>
          <p>Stock Management System</p>
        </div>
        <div class="body">
          <p>You requested to <strong>${action}</strong>. Use the OTP below:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="expiry">⏱ This OTP is valid for <strong>10 minutes</strong> only.</p>
          <p style="color: #ef4444; font-size: 13px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2024 Inventory Pro. Do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Inventory Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html
  });
};

module.exports = { generateOTP, sendOTPEmail };
