const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import the User blueprint
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// 1. SIGNUP API (Part of "Create Account" in User Flow)
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists in the Users collection (by email or username)
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) return res.status(400).json({ message: "User with that email or username already exists" });

    // Hashing the password (The "Blender" logic)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Saving to the Database
    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "Account created! You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// 2. LOGIN API (Matches POST /api/auth/login in the diagram)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

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
      process.env.JWT_SECRET || "secret_key", // Use a secret from your .env
      { expiresIn: "1h" },
    );

    // Return the token to the Frontend as shown in the diagram
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, termsAccepted: user.termsAccepted, avatar: user.avatar },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// 3. ACCEPT TERMS API
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
    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).json({ message: "Username already taken" });
    }
    if (email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: "Email already taken" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// 6. UPLOAD AVATAR
router.post("/avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ avatar: user.avatar, message: "Avatar updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error uploading avatar" });
  }
});

module.exports = router;
