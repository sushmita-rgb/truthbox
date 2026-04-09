const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
dotenv.config();
const app = express();
app.use(express.json());
const PORT = 5000;
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/truthbox";
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
// This is a "Route"
app.get("/", (req, res) => {
  res.send("TruthBox Server is Live!");
});
app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
