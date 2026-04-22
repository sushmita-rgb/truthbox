const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const Link = require("../models/Link");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/feedback/send-feedback/:linkId
router.post("/send-feedback/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    // Find the link to get the receiverId
    const link = await Link.findOne({ linkId, isActive: true });
    
    if (!link) {
      return res.status(404).json({ message: "Link not found or inactive" });
    }

    const newFeedback = new Feedback({
      receiverId: link.userId,
      linkId: link.linkId,
      message,
    });

    await newFeedback.save();

    res.status(201).json({ message: "Feedback sent successfully" });
  } catch (error) {
    console.error("Error sending feedback:", error);
    res.status(500).json({ message: "Server error sending feedback" });
  }
});

// GET /api/feedback/my-feedback (Protected)
router.get("/my-feedback", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all feedback where receiverId matches the current user
    const feedbacks = await Feedback.find({ receiverId: userId }).sort({ createdAt: -1 });
    
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Server error fetching feedback" });
  }
});

module.exports = router;
