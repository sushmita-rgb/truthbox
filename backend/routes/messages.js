const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Issue = require("../models/Issue");
const auth = require("../middleware/authMiddleware");
const requireTerms = require("../middleware/requireTerms");

// Submit an anonymous message to an issue
router.post("/:issueId", async (req, res) => {
  try {
    const { content } = req.body;
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const message = new Message({
      recipientId: issue.userId,
      issueId: issue._id,
      content,
      category: "general" // Default category
    });

    await message.save();
    res.status(201).json({ message: "Feedback sent anonymously!" });
  } catch (error) {
    console.error("Message Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all messages for the logged-in user
router.get("/", auth, requireTerms, async (req, res) => {
  try {
    // Populate the issue data to show what they are replying to
    const messages = await Message.find({ recipientId: req.user.id })
      .populate("issueId", "title")
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
