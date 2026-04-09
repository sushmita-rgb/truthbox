const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import the User blueprint
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 1. REGISTER API (Part of "Create Account" in User Flow)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists in the Users collection
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

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
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
