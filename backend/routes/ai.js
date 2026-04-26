const express = require("express");
const router = express.Router();

// Dummy AI logic (kal real AI se replace karenge)
router.post("/moderate", async (req, res) => {
    const { message } = req.body;

    // Basic filtering logic
    const bannedWords = ["hate", "abuse", "stupid"];

    const isToxic = bannedWords.some((word) =>
        message.toLowerCase().includes(word)
    );

    if (isToxic) {
        return res.json({ allowed: false, reason: "Toxic content detected" });
    }

    res.json({ allowed: true, message: "Message is safe" });
});

module.exports = router;
