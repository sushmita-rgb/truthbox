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

const { OAuth2Client } = require("google-auth-library");
const useragent = require("useragent");
const requestIp = require("request-ip");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { transporter, sendLoginAlert } = require("../utils/mailer");
const Otp = require("../models/Otp");

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

    console.log(`🔑 DEBUG: OTP for ${email} is [ ${code} ]`);

    // Send email using Nodemailer
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "Verit"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verit Verification Code",
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #ffffff; padding: 40px; border: 1px solid #1c1c1c; border-radius: 24px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #97ce23; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px;">VERIT</h1>
            <p style="color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Authentic. Private. Powerful.</p>
          </div>
          <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1c1c1c;">
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 10px;">Verify your identity</h2>
            <p style="font-size: 14px; color: #999; line-height: 1.6;">Use the code below to complete your verification. This code is valid for 10 minutes.</p>
            <div style="font-size: 42px; font-weight: 900; color: #97ce23; letter-spacing: 8px; padding: 30px; background: #000; border: 1px solid #97ce2322; border-radius: 16px; text-align: center; margin: 25px 0; font-family: monospace;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #444; text-align: center; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 11px; color: #333;">&copy; 2026 Verit. Built for the future of communication.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Verification code sent to your email" });
  } catch (err) {
    console.error("❌ OTP Send Failure Details:", {
      message: err.message,
      code: err.code,
      response: err.response
    });
    res.status(500).json({ message: "Server error sending OTP. Please check your email configuration." });
  }
});

// 1.5 SIGNUP API (Part of "Create Account" in User Flow)
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if email is already registered
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email is already registered" });

    // Check if username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username is already taken" });

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Saving to the Database (Direct Signup - No OTP needed as per user request)
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    
    // Send notification to Verit Admin
    try {
      const mailOptions = {
        from: `"Verit System" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: "New User Joined: " + username,
        html: `<h3>New Signup Detected</h3><p>User <b>${username}</b> (${email}) just joined TruthBox!</p>`
      };
      transporter.sendMail(mailOptions); // Non-blocking
    } catch (e) {
      console.log("Admin notification failed, but user created.");
    }

    // Auto-login: Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({ 
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan || "free",
        instagramHandle: user.instagramHandle
      }
    });
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

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "Verit"}" Security <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verit Password Reset",
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #ffffff; padding: 40px; border: 1px solid #1c1c1c; border-radius: 24px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #97ce23; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px;">VERIT</h1>
            <p style="color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Security Center</p>
          </div>
          <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1c1c1c;">
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 10px;">Reset your password</h2>
            <p style="font-size: 14px; color: #999; line-height: 1.6;">You requested to reset your password. Use the secure code below to proceed.</p>
            <div style="font-size: 42px; font-weight: 900; color: #ff4d4d; letter-spacing: 8px; padding: 30px; background: #000; border: 1px solid #ff4d4d22; border-radius: 16px; text-align: center; margin: 25px 0; font-family: monospace;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #444; text-align: center; margin: 0;">If you didn't request this reset, your account is still secure. No action is needed.</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 11px; color: #333;">&copy; 2026 Verit. Security Alerts.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

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

// 1.8 GOOGLE LOGIN API
router.post("/google-login", async (req, res) => {
  try {
    const { token: googleToken, isSignup } = req.body;
    if (!googleToken) return res.status(400).json({ message: "Google token is required" });

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId: sub }, { email: email }] });

    if (isSignup && user) {
      return res.status(400).json({ message: "An account with this email already exists. Please use the Login page to sign in." });
    }

    if (!user) {
      // Create new user if not exists
      // Generate a unique username from name
      let username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
      
      user = new User({
        username,
        email,
        googleId: sub,
        avatar: picture,
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google ID if user exists by email but hasn't used Google before
      user.googleId = sub;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send Login Notification
    const clientIp = requestIp.getClientIp(req);
    const agent = useragent.parse(req.headers["user-agent"]);
    const deviceInfo = {
      ip: clientIp,
      device: agent.device.toString() === "Other 0.0.0" ? agent.os.toString() : agent.device.toString(),
      browser: agent.toAgent(),
    };
    sendLoginAlert(user.email, user.username, deviceInfo);

    const isProd = process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT === "production";
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: isProd, 
      sameSite: isProd ? "none" : "lax", 
      maxAge: 3600000 
    });

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, plan: user.plan || "free" }
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ message: "Failed to authenticate with Google" });
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
    const isProd = process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT === "production";
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: isProd, 
      sameSite: isProd ? "none" : "lax", 
      maxAge: 3600000 
    });
    // Send Login Notification
    const clientIp = requestIp.getClientIp(req);
    const agent = useragent.parse(req.headers["user-agent"]);
    const deviceInfo = {
      ip: clientIp,
      device: agent.device.toString() === "Other 0.0.0" ? agent.os.toString() : agent.device.toString(),
      browser: agent.toAgent(),
    };
    sendLoginAlert(user.email, user.username, deviceInfo);

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, termsAccepted: user.termsAccepted, avatar: user.avatar, instagramHandle: user.instagramHandle || "" },
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
      
      const isProd = process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT === "production";
      res.cookie("admin_token", token, { 
        httpOnly: true, 
        secure: isProd, 
        sameSite: isProd ? "none" : "lax", 
        maxAge: 8 * 3600000 
      });
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
  const isProd = process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT === "production";
  res.clearCookie("token", { 
    httpOnly: true, 
    secure: isProd, 
    sameSite: isProd ? "none" : "lax" 
  });
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
    user.instagramHandle = req.body.instagramHandle !== undefined ? req.body.instagramHandle : user.instagramHandle;
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
