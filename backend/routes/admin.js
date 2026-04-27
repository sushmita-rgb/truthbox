const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Link = require("../models/Link");
const Feedback = require("../models/Feedback");
const Payment = require("../models/Payment");
const SystemConfig = require("../models/SystemConfig");
const AuditLog = require("../models/AuditLog");
const adminMiddleware = require("../middleware/adminMiddleware");

// Ensure all routes require admin auth
router.use(adminMiddleware);

// Utility to log admin actions
const logAction = async (email, action, details) => {
  try {
    await AuditLog.create({ adminEmail: email, action, details });
  } catch (err) {
    console.error("Audit log failed", err);
  }
};

// 1. GET STATS
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLinks = await Link.countDocuments();
    const deletedLinks = await Link.countDocuments({ isDeleted: true });
    const activeLinks = totalLinks - deletedLinks;
    const totalFeedback = await Feedback.countDocuments();

    // Projected MRR
    const proUsers = await User.countDocuments({ plan: "pro" });
    const ultraUsers = await User.countDocuments({ plan: "ultra" });
    const mrr = (proUsers * 499) + (ultraUsers * 999);

    // Active users in last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dau = await User.countDocuments({ lastActive: { $gte: oneDayAgo } });

    // Conversion Rate
    const conversionRate = totalUsers > 0 ? (((proUsers + ultraUsers) / totalUsers) * 100).toFixed(1) : 0;

    res.json({
      totalUsers,
      totalLinks,
      activeLinks,
      deletedLinks,
      totalFeedback,
      proUsers,
      ultraUsers,
      mrr,
      dau,
      conversionRate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching stats" });
  }
});

// 2. GET CHARTS DATA
router.get("/charts", async (req, res) => {
  try {
    // Top Links by feedback count
    const topLinks = await Feedback.aggregate([
      { $group: { _id: "$linkId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Let's populate the link titles for those
    const linkIds = topLinks.map(t => t._id);
    const linksData = await Link.find({ linkId: { $in: linkIds } });
    const topLinksWithTitles = topLinks.map(t => {
      const link = linksData.find(l => l.linkId === t._id);
      return { id: t._id, title: link?.title || "Unknown Link", feedbackCount: t.count };
    });

    // 30 days growth (mocked simply by grouping by day if needed, but for simplicity returning raw recent records to chart)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const usersTimeline = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Geo Map data
    const geoData = await Feedback.aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      topLinks: topLinksWithTitles,
      usersTimeline,
      geoData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching charts" });
  }
});

// 3. GET USERS LIST
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const users = await User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await User.countDocuments();

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// 3.5 GET USER DETAILS (Full Profile)
router.get("/users/:id/details", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const links = await Link.find({ userId: user._id }).sort({ createdAt: -1 });
    const feedback = await Feedback.find({ receiverId: user._id }).sort({ createdAt: -1 });

    res.json({
      user,
      links,
      feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching user details" });
  }
});

// 4. OVERRIDE PLAN
router.put("/users/:id/plan", async (req, res) => {
  try {
    const { plan } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { plan }, { new: true });
    await logAction(req.admin.email, "UPDATE_PLAN", { userId: user._id, plan });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating plan" });
  }
});

// 5. BAN USER
router.put("/users/:id/ban", async (req, res) => {
  try {
    const { isBanned } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned }, { new: true });
    await logAction(req.admin.email, "TOGGLE_BAN", { userId: user._id, isBanned });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error banning user" });
  }
});

// 6. DELETE USER
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    await Link.deleteMany({ userId: req.params.id });
    await Feedback.deleteMany({ receiverId: req.params.id });
    await logAction(req.admin.email, "DELETE_USER", { userId: user._id });
    res.json({ message: "User completely deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

// 7. GET SYSTEM CONFIG
router.get("/system", async (req, res) => {
  try {
    let maintenance = await SystemConfig.findOne({ key: "maintenanceMode" });
    if (!maintenance) {
      maintenance = await SystemConfig.create({ key: "maintenanceMode", value: false });
    }
    
    const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(10);
    res.json({ maintenanceMode: maintenance.value, logs: recentLogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching system config" });
  }
});

// 8. TOGGLE MAINTENANCE
router.put("/system/maintenance", async (req, res) => {
  try {
    const { enabled } = req.body;
    const conf = await SystemConfig.findOneAndUpdate(
      { key: "maintenanceMode" }, 
      { value: enabled }, 
      { upsert: true, new: true }
    );
    await logAction(req.admin.email, "TOGGLE_MAINTENANCE", { enabled });
    res.json(conf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error toggling maintenance" });
  }
});

module.exports = router;
