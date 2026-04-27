const express = require("express");
const router = express.Router();
const Link = require("../models/Link");
const Feedback = require("../models/Feedback");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const requireTerms = require("../middleware/requireTerms");
const { nanoid } = require("nanoid");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// ── Plan limits ──────────────────────────────────────────────────────────────
const PLAN_LIMITS = { free: 5, pro: 20, ultra: Infinity };

const { uploadFeedback, cloudinary } = require("../config/cloudinary");

// ── Get Cloudinary Signature for Direct Upload ───────────────────────────────
router.get("/sign-upload", authMiddleware, async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "Verit/feedback";
    
    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (err) {
    console.error("Signature error:", err);
    res.status(500).json({ message: "Failed to generate upload signature" });
  }
});

// ── Increment view count (Public) ────────────────────────────────────────────
router.post("/:linkId/view", async (req, res) => {
  try {
    await Link.findOneAndUpdate(
      { linkId: req.params.linkId },
      { $inc: { views: 1 } }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── Upload Middlewares ────────────────────────────────────────────────────────
const uploadFeedbackMiddleware = (req, res, next) => {
  uploadFeedback.single("file")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ message: "File size exceeds 100MB limit." });
        return;
      }
    }

    res.status(400).json({ message: err.message || "Failed to upload file." });
  });
};

const normalizeAccentColor = (value) => {
  if (typeof value !== "string") return "#97ce23";
  const trimmed = value.trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : "#97ce23";
};

const buildResponseCounts = async (userId) => {
  const counts = await Feedback.aggregate([
    { $match: { receiverId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$linkId", count: { $sum: 1 } } },
  ]);

  return counts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
};

router.get("/usage", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("plan");
    const plan = user?.plan || "free";
    const limit = PLAN_LIMITS[plan];
    const used = await Link.countDocuments({ userId });
    res.json({
      plan,
      used,
      limit: limit === Infinity ? null : limit,
      percentage: limit === Infinity ? 0 : Math.min(100, Math.round((used / limit) * 100)),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching usage" });
  }
});

router.post(
  "/create-link",
  authMiddleware,
  requireTerms,
  uploadFeedbackMiddleware,
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
        directUrl = "",
        directFileName = "",
      } = req.body;

      // ── Plan limit check ──────────────────────────────────────────────────
      const user = await User.findById(userId).select("plan");
      const plan = user?.plan || "free";
      const limit = PLAN_LIMITS[plan];
      const used = await Link.countDocuments({ userId });
      if (used >= limit) {
        return res.status(403).json({
          code: "PLAN_LIMIT_REACHED",
          message: `You've reached the ${plan} plan limit of ${limit} links.`,
          plan,
          used,
          limit,
        });
      }
      // ─────────────────────────────────────────────────────────────────────

      if (postType === "text" && !content.trim()) {
        return res.status(400).json({ message: "Text content is required" });
      }

      if (postType === "url" && !content.trim()) {
        return res.status(400).json({ message: "URL is required" });
      }

      if (["image", "video"].includes(postType) && !req.file && !directUrl) {
        return res.status(400).json({ message: "File upload is required for this post type" });
      }

      const linkId = nanoid(8);

      // We'll use either the multer file OR the direct upload URL
      const finalFileUrl = req.file ? req.file.path : directUrl;
      const finalFileName = req.file ? req.file.originalname : directFileName;

      if (req.file) {
        console.log("[DEBUG] Multer Upload:", {
          path: req.file.path,
          originalname: req.file.originalname
        });
      } else if (directUrl) {
        console.log("[DEBUG] Direct Upload:", { directUrl, directFileName });
      }

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
        fileUrl: finalFileUrl,
        fileName: finalFileName,
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
      Link.find({ userId, isDeleted: false }).sort({ createdAt: -1 }).lean(),
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
      Link.find({ userId, isDeleted: false }).sort({ createdAt: -1 }).lean(),
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
      isDeleted: false,
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
    const link = await Link.findOneAndUpdate(
      { linkId: req.params.linkId, userId: req.user.id },
      { isDeleted: true, isActive: false, deletedAt: new Date() },
      { new: true }
    );

    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    // We don't delete feedbacks, we keep them archived with the deleted link
    // but they won't show up in active dashboard stats anymore due to filter above

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
      isDeleted: false,
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

// ── Get Deleted Links ────────────────────────────────────────────────────────
router.get("/deleted-links", authMiddleware, requireTerms, async (req, res) => {
  try {
    const userId = req.user.id;
    const links = await Link.find({ userId, isDeleted: true }).sort({ deletedAt: -1 }).lean();
    res.json(links);
  } catch (error) {
    console.error("Error fetching deleted links:", error);
    res.status(500).json({ message: "Server error fetching deleted links" });
  }
});

module.exports = router;
