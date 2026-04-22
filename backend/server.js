const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const linkRoutes = require("./routes/links");
const feedbackRoutes = require("./routes/feedback");
const cors = require("cors");
const path = require("path");

dotenv.config();
const app = express();

// ✅ FIXED ORDER
app.use(cors());
app.use(express.json());

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/feedback", feedbackRoutes);

const PORT = 5000;

const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/truthbox";

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("TruthBox Server is Live!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:5000`);
});