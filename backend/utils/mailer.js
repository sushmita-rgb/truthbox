const nodemailer = require("nodemailer");

// Simple Gmail configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Mailer Connection Error:", error);
  } else {
    console.log("✅ Mailer is ready to send emails");
  }
});

module.exports = transporter;
