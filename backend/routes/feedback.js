const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const Link = require("../models/Link");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const requireTerms = require("../middleware/requireTerms");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const rateLimit = require("express-rate-limit");

// Rate limit: 5 feedback submissions per 10 minutes per IP
const feedbackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: "Too many feedback submissions from this IP. Please try again after 10 minutes." },
});

// POST /api/feedback/send-feedback/:linkId
router.post("/send-feedback/:linkId", feedbackLimiter, async (req, res) => {
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

    // Capture Geo IP
    const geoip = require("geoip-lite");
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : "Unknown";

    // AI Toxicity Filter
    let isToxic = false;
    try {
      const { GoogleGenAI } = require("@google/genai");
      if (process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Analyze this text for severe cyberbullying, threats, explicit hate speech, or extreme toxicity. 
                        Respond with exactly the word "TOXIC" if it is highly abusive or dangerous. 
                        Respond with exactly the word "SAFE" if it is normal criticism, banter, or safe content.
                        Text to analyze: "${message}"`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResult = response.text().trim().toUpperCase();
        
        if (aiResult.includes("TOXIC")) {
          isToxic = true;
          console.log(`[AI MODERATION] Blocked message for toxicity: ${message}`);
        }
      }
    } catch (aiError) {
      console.error("AI Moderation failed:", aiError);
      // Failsafe: if AI fails, we let the message through (safe by default)
    }

    const newFeedback = new Feedback({
      receiverId: link.userId,
      linkId: link.linkId,
      message,
      country,
      isToxic
    });

    await newFeedback.save();

    // Trigger Email Notification
    try {
      const receiver = await User.findById(link.userId);
      if (receiver && receiver.email) {
        await resend.emails.send({
          from: `${process.env.EMAIL_FROM_NAME || "Verit"} Notifications <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
          to: receiver.email,
          subject: "You received new anonymous feedback!",
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 16px;">
              <h1 style="color: #97ce23; margin-bottom: 20px;">New Feedback!</h1>
              <p style="font-size: 16px; color: #aaa;">Someone just submitted anonymous feedback on your link <strong>${link.title || link.linkId}</strong>.</p>
              
              <div style="font-size: 16px; font-style: italic; padding: 20px; background: #111; border-left: 4px solid #97ce23; border-radius: 0 8px 8px 0; margin: 20px 0;">
                "${message.length > 50 ? message.substring(0, 50) + '...' : message}"
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://verit-chi.vercel.app/dashboard" style="background-color: #97ce23; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Read Full Message
                </a>
              </div>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error("Failed to send notification email:", emailErr);
      // We don't return an error to the user if the email fails, the feedback was still saved successfully.
    }

    res.status(201).json({ message: "Feedback sent successfully" });
  } catch (error) {
    console.error("Error sending feedback:", error);
    res.status(500).json({ message: "Server error sending feedback" });
  }
});

// GET /api/feedback/my-feedback (Protected)
router.get("/my-feedback", authMiddleware, requireTerms, async (req, res) => {
  try {
    const userId = req.user.id;
    const feedback = await Feedback.find({ receiverId: userId }).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Server error fetching feedback" });
  }
});

// DELETE /api/feedback/:id (Protected)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ _id: req.params.id, receiverId: req.user.id });
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found or unauthorized" });
    }
    await Feedback.deleteOne({ _id: req.params.id });
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ message: "Server error deleting feedback" });
  }
});

module.exports = router;
