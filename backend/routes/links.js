const express = require("express");
const router = express.Router();
const Link = require("../models/Link");
const authMiddleware = require("../middleware/authMiddleware");
const { nanoid } = require("nanoid");

// POST /api/links/create-link (Protected)
router.post("/create-link", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Generate a unique short link ID using nanoid (e.g., 8 characters)
    const linkId = nanoid(8);
    
    const newLink = new Link({
      userId,
      linkId,
      isActive: true
    });

    await newLink.save();
    
    res.status(201).json({ 
      message: "Link created successfully", 
      linkId: newLink.linkId,
      url: `/feedback/${newLink.linkId}` 
    });
  } catch (error) {
    console.error("Error creating link:", error);
    res.status(500).json({ message: "Server error creating link" });
  }
});

module.exports = router;
