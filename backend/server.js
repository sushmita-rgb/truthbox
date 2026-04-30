const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const linkRoutes = require("./routes/links");
const feedbackRoutes = require("./routes/feedback");
const paymentRoutes = require("./routes/payment");
const cors = require("cors");
const path = require("path");

dotenv.config();
const app = express();

// Trust proxy for Railway/Vercel (fixes ERR_ERL_UNEXPECTED_X_FORWARDED_FOR)
app.set("trust proxy", 1);

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET environment variable.");
  process.exit(1);
}

const rateLimit = require("express-rate-limit");

// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests from this IP. Please try again later." },
});

const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

// ✅ FIXED ORDER
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "https://verit-chi.vercel.app",
      "https://rit-chi.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000"
    ];

    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.includes("localhost")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Pass socket.io instance to the app
app.set("socketio", io);

app.use(cookieParser());
// Capture raw body for Razorpay Webhooks
app.use(express.json({
  limit: "100mb",
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(globalLimiter);

// Uploads now handled securely via Cloudinary

const shareRoutes = require("./routes/share");
const adminRoutes = require("./routes/admin");
const systemRoutes = require("./routes/system");

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: "Too many admin requests from this IP. Please try again later." },
});

app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/admin", adminLimiter, adminRoutes);
app.use("/api/system", systemRoutes);

const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/Verit";

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Verit Server is Live!");
});

// Real-time connection handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server using the HTTP server instance - v1.1.0
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
