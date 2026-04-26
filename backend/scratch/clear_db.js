const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");
const Link = require("../models/Link");
const Feedback = require("../models/Feedback");
const Otp = require("../models/Otp");
const Payment = require("../models/Payment");

async function clearDatabase() {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/truthbox";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for cleanup...");

    // Delete all documents from all relevant collections
    await User.deleteMany({});
    console.log("✅ Users cleared");

    await Link.deleteMany({});
    console.log("✅ Links cleared");

    await Feedback.deleteMany({});
    console.log("✅ Feedback cleared");

    await Otp.deleteMany({});
    console.log("✅ OTPs cleared");

    await Payment.deleteMany({});
    console.log("✅ Payments cleared");

    console.log("\n🔥 ALL DATA DELETED SUCCESSFULLY. You can now start fresh.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  }
}

clearDatabase();
