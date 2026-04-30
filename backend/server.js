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
const helmet = require("helmet");
const hpp = require("hpp");

dotenv.config();
const app = express();

// 1. Security Headers
app.use(helmet());

// 2. Data Sanitization
// xss-clean is removed as it's incompatible with current Node.js versions
app.use(hpp()); // Against HTTP Parameter Pollution

// Trust proxy for Railway/Vercel
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
  standardHeaders: true,
  legacyHeaders: false,
});

const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

// ✅ Tightened CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g. https://verit-chi.vercel.app
  "https://verit-chi.vercel.app",
  "https://rit-chi.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Strict origin check
    if (allowedOrigins.includes(origin) || (process.env.NODE_ENV !== "production" && origin.includes("localhost"))) {
      callback(null, true);
    } else {
      console.warn(`[SECURITY] Blocked request from unauthorized origin: ${origin}`);
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
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("socketio", io);
app.use(cookieParser());

app.use(express.json({
  limit: "10mb", // Restricted size
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(globalLimiter);

// Routes
const shareRoutes = require("./routes/share");
const adminRoutes = require("./routes/admin");
const systemRoutes = require("./routes/system");

app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/system", systemRoutes);

const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("Missing MONGO_URI environment variable.");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Verit Server is Live!");
});

// Real-time connection handler
io.on("connection", (socket) => {
  socket.on("disconnect", () => {});
});

// ✅ Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, {
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: process.env.NODE_ENV === "production" 
      ? "An internal server error occurred" 
      : err.message
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
