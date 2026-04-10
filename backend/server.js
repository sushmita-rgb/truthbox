const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");

dotenv.config();
const app = express();

// ✅ FIXED ORDER
app.use(express.json());
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);

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