const express = require("express");
const router = express.Router();
const Link = require("../models/Link");
const authMiddleware = require("../middleware/authMiddleware");
const { nanoid } = require("nanoid");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "application/pdf",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// POST /api/links/create-link (Protected)
router.post(
  "/create-link",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { postType = "text", content = "" } = req.body;

      // Validate based on type
      if (postType === "text" && !content.trim()) {
        return res.status(400).json({ message: "Text content is required" });
      }
      if (postType === "url" && !content.trim()) {
        return res.status(400).json({ message: "URL is required" });
      }
      if (["image", "pdf", "video"].includes(postType) && !req.file) {
        return res
          .status(400)
          .json({ message: "File upload is required for this post type" });
      }

      const linkId = nanoid(8);

      const newLink = new Link({
        userId,
        linkId,
        isActive: true,
        postType,
        content: content || "",
        fileUrl: req.file ? `/uploads/${req.file.filename}` : "",
        fileName: req.file ? req.file.originalname : "",
      });

      await newLink.save();

      res.status(201).json({
        message: "Link created successfully",
        linkId: newLink.linkId,
        url: `/feedback/${newLink.linkId}`,
        postType: newLink.postType,
      });
    } catch (error) {
      console.error("Error creating link:", error);
      res.status(500).json({ message: "Server error creating link" });
    }
  }
);

// GET /api/links/:linkId — fetch post info for feedback page
router.get("/:linkId", async (req, res) => {
  try {
    const link = await Link.findOne({
      linkId: req.params.linkId,
      isActive: true,
    });
    if (!link) {
      return res.status(404).json({ message: "Link not found or inactive" });
    }
    res.status(200).json({
      postType: link.postType,
      content: link.content,
      fileUrl: link.fileUrl,
      fileName: link.fileName,
    });
  } catch (error) {
    console.error("Error fetching link:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
