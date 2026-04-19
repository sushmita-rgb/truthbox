const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Issue = require("../models/Issue");
const auth = require("../middleware/authMiddleware");
const requireTerms = require("../middleware/requireTerms");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Create a new Issue
router.post("/", auth, requireTerms, upload.single("file"), async (req, res) => {
  try {
    const { title, description, linkUrl } = req.body;
    let fileUrl = null;
    let fileType = "none";

    // If an actual file was uploaded
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      const mime = req.file.mimetype;
      if (mime.startsWith("image/")) fileType = "image";
      else if (mime.startsWith("video/")) fileType = "video";
      else fileType = "image"; // fallback
    } 
    // If a text URL link was provided instead
    else if (linkUrl && linkUrl.trim() !== "") {
      fileUrl = linkUrl;
      fileType = "link";
    }

    const issue = new Issue({
      userId: req.user.id,
      title,
      description,
      fileUrl,
      fileType,
    });

    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's issues
router.get("/", auth, requireTerms, async (req, res) => {
  try {
    const issues = await Issue.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get issue publicly (No auth required)
router.get("/public/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate("userId", "username");
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    
    // We only send safe info
    res.json({
      _id: issue._id,
      title: issue.title,
      description: issue.description,
      fileUrl: issue.fileUrl,
      fileType: issue.fileType,
      author: issue.userId.username,
      createdAt: issue.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
