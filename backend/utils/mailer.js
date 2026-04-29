const nodemailer = require("nodemailer");

// Simple Gmail configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4, // Force IPv4 to avoid ENETUNREACH errors on cloud hosts
  pool: true,
  maxConnections: 5,
  connectionTimeout: 10000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Mailer Connection Error:", error);
  } else {
    console.log("✅ Mailer is ready to send emails");
  }
});

const sendLoginAlert = async (email, username, deviceInfo) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "Verit"}" Security <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Security Alert: New Login to your Verit account",
    html: `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #ffffff; padding: 40px; border: 1px solid #1c1c1c; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #97ce23; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px;">VERIT</h1>
          <p style="color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Security Notification</p>
        </div>
        <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1c1c1c;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 15px; color: #ffffff;">New login detected</h2>
          <p style="font-size: 14px; color: #94A3B8; line-height: 1.6;">Hello <strong>${username}</strong>, we noticed a new login to your account. If this was you, you can safely ignore this email.</p>
          
          <div style="margin: 25px 0; padding: 20px; background: #000; border: 1px solid #334155; border-radius: 16px;">
            <table style="width: 100%; font-size: 13px; color: #E2E8F0; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748B; width: 100px;">Device:</td>
                <td style="padding: 8px 0;">${deviceInfo.device || "Unknown"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748B;">Browser:</td>
                <td style="padding: 8px 0;">${deviceInfo.browser || "Unknown"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748B;">IP Address:</td>
                <td style="padding: 8px 0;">${deviceInfo.ip || "Unknown"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748B;">Time:</td>
                <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 12px; color: #64748B; text-align: center; margin: 0; line-height: 1.6;">
            If you don't recognize this activity, please <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/forgot-password" style="color: #97ce23; font-weight: bold; text-decoration: none;">reset your password</a> immediately to secure your account.
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 11px; color: #334155;">&copy; 2026 Verit Security Team.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Security alert sent to ${email}`);
  } catch (err) {
    console.error("❌ Failed to send security alert:", err);
  }
};

module.exports = { transporter, sendLoginAlert };
