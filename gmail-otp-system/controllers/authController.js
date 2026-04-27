const nodemailer = require("nodemailer");

// In-memory storage for OTPs
// Key: email, Value: { otp: string, expiresAt: number }
const otpStore = new Map();

/**
 * Configure Nodemailer with Gmail
 * Note: You must use a Gmail "App Password"
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── 1. SEND OTP ──
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    // Store OTP in memory
    otpStore.set(email, { otp, expiresAt });
    console.log(`[TESTING] OTP generated for ${email}: ${otp}`);

    // Email Content
    const mailOptions = {
      from: `"OTP Verification" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4CAF50;">Verify Your Account</h2>
          <p>Your 6-digit verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #777; font-size: 12px;">This code expires in 5 minutes.</p>
        </div>
      `,
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully to " + email });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
};

// ── 2. VERIFY OTP ──
exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const storedData = otpStore.get(email);

  // Check if OTP exists
  if (!storedData) {
    return res.status(400).json({ message: "No OTP found for this email" });
  }

  // Check Expiry
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email); // Clean up
    return res.status(400).json({ message: "OTP has expired" });
  }

  // Check Match
  if (storedData.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP code" });
  }

  // Success
  otpStore.delete(email); // Remove after successful verification
  res.status(200).json({ message: "OTP verified successfully!" });
};
