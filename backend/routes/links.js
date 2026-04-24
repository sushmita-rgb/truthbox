const express = require("express");
const router = express.Router();
const Link = require("../models/Link");
const Feedback = require("../models/Feedback");
const authMiddleware = require("../middleware/authMiddleware");
const requireTerms = require("../middleware/requireTerms");
const { nanoid } = require("nanoid");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
    return;
  }

  cb(new Error("Unsupported file type"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const normalizeAccentColor = (value) => {
  if (typeof value !== "string") return "#97ce23";
  const trimmed = value.trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : "#97ce23";
};

const buildResponseCounts = async (userId) => {
  const counts = await Feedback.aggregate([
    { $match: { receiverId: userId } },
    { $group: { _id: "$linkId", count: { $sum: 1 } } },
  ]);

  return counts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
};

router.post(
  "/create-link",
  authMiddleware,
  requireTerms,
  upload.single("file"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        postType = "text",
        content = "",
        title = "",
        description = "",
        accentColor,
        templateKey = "custom",
      } = req.body;

      if (postType === "text" && !content.trim()) {
        return res.status(400).json({ message: "Text content is required" });
      }

      if (postType === "url" && !content.trim()) {
        return res.status(400).json({ message: "URL is required" });
      }

      if (["image", "pdf", "video"].includes(postType) && !req.file) {
        return res.status(400).json({ message: "File upload is required for this post type" });
      }

      const linkId = nanoid(8);

      const newLink = new Link({
        userId,
        linkId,
        isActive: true,
        postType,
        content: content || "",
        title: title.trim(),
        description: description.trim(),
        accentColor: normalizeAccentColor(accentColor),
        templateKey: templateKey.trim() || "custom",
        fileUrl: req.file ? `/uploads/${req.file.filename}` : "",
        fileName: req.file ? req.file.originalname : "",
      });

      await newLink.save();

      res.status(201).json({
        message: "Link created successfully",
        linkId: newLink.linkId,
        url: `/feedback/${newLink.linkId}`,
        postType: newLink.postType,
        title: newLink.title,
        description: newLink.description,
        accentColor: newLink.accentColor,
        templateKey: newLink.templateKey,
      });
    } catch (error) {
      console.error("Error creating link:", error);
      res.status(500).json({ message: "Server error creating link" });
    }
  }
);

router.get("/my-links", authMiddleware, requireTerms, async (req, res) => {
  try {
    const userId = req.user.id;
    const [links, responseCounts] = await Promise.all([
      Link.find({ userId }).sort({ createdAt: -1 }).lean(),
      buildResponseCounts(userId),
    ]);

    const enrichedLinks = links.map((link) => ({
      ...link,
      responseCount: responseCounts[link.linkId] || 0,
    }));

    res.json(enrichedLinks);
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).json({ message: "Server error fetching links" });
  }
});

router.get("/analytics", authMiddleware, requireTerms, async (req, res) => {
  try {
    const userId = req.user.id;
    const [links, feedbacks, responseCounts] = await Promise.all([
      Link.find({ userId }).sort({ createdAt: -1 }).lean(),
      Feedback.find({ receiverId: userId }).sort({ createdAt: -1 }).lean(),
      buildResponseCounts(userId),
    ]);

    const totalLinks = links.length;
    const activeLinks = links.filter((link) => link.isActive).length;
    const totalResponses = feedbacks.length;
    const responsesThisWeek = feedbacks.filter(
      (item) => Date.now() - new Date(item.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;

    const responseByType = links.reduce((acc, link) => {
      acc[link.postType] = (acc[link.postType] || 0) + (responseCounts[link.linkId] || 0);
      return acc;
    }, {});

    const dailyResponses = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = feedbacks.filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt >= date && createdAt < nextDate;
      }).length;

      return {
        label: date.toLocaleDateString(undefined, { weekday: "short" }),
        value: count,
      };
    });

    const topLink =
      links
        .map((link) => ({
          ...link,
          responseCount: responseCounts[link.linkId] || 0,
        }))
        .sort((a, b) => b.responseCount - a.responseCount)[0] || null;

    res.json({
      summary: {
        totalLinks,
        activeLinks,
        totalResponses,
        responsesThisWeek,
      },
      responseByType,
      dailyResponses,
      topLink,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error fetching analytics" });
  }
});

router.patch("/:linkId/toggle", authMiddleware, requireTerms, async (req, res) => {
  try {
    const link = await Link.findOne({
      linkId: req.params.linkId,
      userId: req.user.id,
    });

    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    link.isActive = !link.isActive;
    await link.save();

    res.json({
      message: link.isActive ? "Link reactivated" : "Link deactivated",
      linkId: link.linkId,
      isActive: link.isActive,
    });
  } catch (error) {
    console.error("Error toggling link status:", error);
    res.status(500).json({ message: "Server error updating link status" });
  }
});

router.delete("/:linkId", authMiddleware, requireTerms, async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({
      linkId: req.params.linkId,
      userId: req.user.id,
    });

    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    await Feedback.deleteMany({
      receiverId: req.user.id,
      linkId: req.params.linkId,
    });

    res.json({ message: "Link deleted successfully", linkId: req.params.linkId });
  } catch (error) {
    console.error("Error deleting link:", error);
    res.status(500).json({ message: "Server error deleting link" });
  }
});

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
      title: link.title,
      description: link.description,
      accentColor: link.accentColor,
      templateKey: link.templateKey,
    });
  } catch (error) {
    console.error("Error fetching link:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
