const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import the User blueprint
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { uploadAvatar } = require("../config/cloudinary");

const uploadAvatarMiddleware = (req, res, next) => {
  uploadAvatar.single("avatar")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ message: "Avatar file size must be 5MB or less." });
        return;
      }
      return;
    }

    res.status(500).json({ message: "Server error uploading avatar" });
  });
};

const { Resend } = require("resend");
const Otp = require("../models/Otp");
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. SEND OTP API
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email is already registered" });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any old OTPs for this email to prevent confusion
    await Otp.deleteMany({ email });

    // Save to DB
    const newOtp = new Otp({ email, code });
    await newOtp.save();

    // Send email using Resend
    await resend.emails.send({
      from: "TruthBox <onboarding@resend.dev>", // Note: resend.dev only sends to verified emails in dev unless you have a custom domain
      to: email,
      subject: "Your TruthBox Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 16px;">
          <h1 style="color: #97ce23; margin-bottom: 20px;">TruthBox</h1>
          <p style="font-size: 16px; color: #aaa;">Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background: #111; border-radius: 8px; text-align: center; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 14px; color: #666;">This code expires in 10 minutes.</p>
        </div>
      `
    });

    res.json({ message: "Verification code sent to your email" });
  } catch (err) {
    console.error("Failed to send OTP:", err);
    res.status(500).json({ message: "Server error sending OTP" });
  }
});

// 1.5 SIGNUP API (Part of "Create Account" in User Flow)
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, otp } = req.body;

    if (!otp) return res.status(400).json({ message: "Verification code is required" });

    // Verify OTP
    const validOtp = await Otp.findOne({ email, code: otp });
    if (!validOtp) return res.status(400).json({ message: "Invalid or expired verification code" });

    // Check if user already exists in the Users collection (by email or username)
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) return res.status(400).json({ message: "User with that email or username already exists" });

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Saving to the Database
    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    
    // Clear the OTP so it can't be reused
    await Otp.deleteOne({ _id: validOtp._id });

    res.status(201).json({ message: "Account created! You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// 1.6 FORGOT PASSWORD API
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    // Ensure user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "If this email exists, a code will be sent." }); // Security best practice: don't reveal if email exists or not directly

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    
    const newOtp = new Otp({ email, code });
    await newOtp.save();

    await resend.emails.send({
      from: "TruthBox Security <onboarding@resend.dev>",
      to: email,
      subject: "TruthBox Password Reset",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 16px;">
          <h1 style="color: #97ce23; margin-bottom: 20px;">Password Reset</h1>
          <p style="font-size: 16px; color: #aaa;">You requested a password reset. Your code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background: #111; border-radius: 8px; text-align: center; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 14px; color: #666;">This code expires in 10 minutes. If you didn't request this, safely ignore this email.</p>
        </div>
      `
    });

    res.json({ message: "Password reset code sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error processing request" });
  }
});

// 1.7 RESET PASSWORD API
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!otp || !newPassword) return res.status(400).json({ message: "Code and new password are required" });

    const validOtp = await Otp.findOne({ email, code: otp });
    if (!validOtp) return res.status(400).json({ message: "Invalid or expired reset code" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ email }, { password: hashedPassword });
    await Otp.deleteOne({ _id: validOtp._id });

    res.json({ message: "Password successfully reset! You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error resetting password" });
  }
});

// 2. LOGIN API (Matches POST /api/auth/login in the diagram)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ message: "Server misconfiguration: missing JWT secret." });
    }

    // Validate credentials against the Database
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: "Invalid username or password" });

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid username or password" });

    // Generate the JWT token (The digital access pass)
    const token = jwt.sign(
      { id: user._id, username: user.username },
      jwtSecret,
      { expiresIn: "1h" },
    );

    // Return the token to the Frontend as shown in the diagram
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 3600000 });
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, termsAccepted: user.termsAccepted, avatar: user.avatar },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// 2.5 ADMIN LOGIN API
router.post("/admin-login", async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();
    console.log("Admin Login Attempt:", { email, envEmail: process.env.ADMIN_EMAIL });
    
    // Validate against .env variables
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const jwtSecret = process.env.JWT_SECRET;
      
      const token = jwt.sign(
        { role: "admin", email: process.env.ADMIN_EMAIL },
        jwtSecret,
        { expiresIn: "8h" }
      );
      
      res.cookie("admin_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 8 * 3600000 });
      return res.json({ message: "Admin logged in successfully", role: "admin" });
    }
    
    return res.status(401).json({ message: "Invalid admin credentials" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during admin login" });
  }
});

// 3. LOGOUT API
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
  res.json({ message: "Logged out successfully" });
});

// 4. ACCEPT TERMS API
router.post("/accept-terms", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.termsAccepted = true;
    user.termsAcceptedAt = new Date();
    await user.save();

    res.json({ message: "Terms accepted", termsAccepted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error accepting terms" });
  }
});

// 4. GET CURRENT USER
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching user profile" });
  }
});

// 5. UPDATE PROFILE
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate existence of other users with the requested username/email
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).json({ message: "Username already taken" });
    }
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: "Email already taken" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// 6. CHANGE PASSWORD
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Current password, new password, and confirmation are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirmation do not match." });
    }

    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordPolicy.test(newPassword)) {
      return res.status(400).json({
        message: "New password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password must be different from the current password." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating password" });
  }
});

// 7. UPLOAD AVATAR
router.post("/avatar", authMiddleware, uploadAvatarMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // req.file.path contains the secure Cloudinary URL
    user.avatar = req.file.path;
    await user.save();

    res.json({ avatar: user.avatar, message: "Avatar updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error uploading avatar" });
  }
});

module.exports = router;
