const express = require("express");
const router = express.Router();
const { Resend } = require("resend");
const SystemConfig = require("../models/SystemConfig");

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// POST /api/system/support
router.post("/support", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Send email to admin
    if (resend) {
      await resend.emails.send({
        from: "Verit Support <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL || "admin@Verit.app",
        subject: `[New Support Ticket] From ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #97ce23;">New Support Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `,
      });
    }

    res.json({ message: "Support request sent successfully" });
  } catch (error) {
    console.error("Support error:", error);
    res.status(500).json({ message: "Server error sending support request" });
  }
});

// GET /api/system/config
router.get("/config", async (req, res) => {
  try {
    const maintenance = await SystemConfig.findOne({ key: "maintenanceMode" });
    res.json({ maintenanceMode: maintenance?.value || false });
  } catch (err) {
    res.json({ maintenanceMode: false });
  }
});

module.exports = router;
