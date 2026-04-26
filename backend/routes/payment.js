const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// ── Plan pricing in paise (INR smallest unit) ─────────────────────────────────
const PLAN_PRICES = {
  pro:   { amount: 49900, label: "Pro",        currency: "INR" },  // ₹499
  ultra: { amount: 99900, label: "Pro Ultra",  currency: "INR" },  // ₹999
};

// Lazily initialise Razorpay so the server still starts without real keys
const getRazorpay = () => {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes("XXXX")) {
    throw new Error("Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// ── POST /api/payment/create-order ───────────────────────────────────────────
// Creates a Razorpay order and a pending Payment document.
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !PLAN_PRICES[plan]) {
      return res.status(400).json({ message: "Invalid plan. Choose 'pro' or 'ultra'." });
    }

    // Prevent downgrade / re-purchase of the same plan
    const user = await User.findById(req.user.id).select("plan");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.plan === plan) {
      return res.status(400).json({ message: `You are already on the ${PLAN_PRICES[plan].label} plan.` });
    }

    const { amount, currency, label } = PLAN_PRICES[plan];

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `tb_${req.user.id}_${Date.now()}`,
      notes: { userId: req.user.id, plan },
    });

    // Persist the order so we can verify it later
    await Payment.create({
      userId:          req.user.id,
      plan,
      razorpayOrderId: order.id,
      amount,
      currency,
      status:          "created",
    });

    res.json({
      orderId:  order.id,
      amount,
      currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
      planName: label,
    });
  } catch (err) {
    console.error("create-order error:", err);
    const userFacing = err.message?.startsWith("Razorpay keys")
      ? err.message
      : "Server error creating payment order";
    res.status(500).json({ message: userFacing });
  }
});

// ── POST /api/payment/verify ──────────────────────────────────────────────────
// Verifies the Razorpay signature, marks the payment as paid, upgrades the plan.
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    // HMAC-SHA256 verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret.includes("XXXX")) {
      return res.status(500).json({ message: "Razorpay keys are not configured" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      // Mark as failed in DB
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: "failed", razorpayPaymentId }
      );
      return res.status(400).json({ message: "Payment signature verification failed" });
    }

    // Find the pending payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Double-check the payment belongs to this user
    if (payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized payment verification" });
    }

    // Mark payment as paid
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status            = "paid";
    await payment.save();

    // Upgrade user plan
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { plan: payment.plan },
      { new: true }
    ).select("-password");

    res.json({
      message: `Plan upgraded to ${payment.plan} successfully!`,
      plan:    user.plan,
      user,
    });
  } catch (err) {
    console.error("verify error:", err);
    res.status(500).json({ message: "Server error verifying payment" });
  }
});

// ── GET /api/payment/history ──────────────────────────────────────────────────
// Returns the authenticated user's payment history.
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(payments);
  } catch (err) {
    console.error("history error:", err);
    res.status(500).json({ message: "Server error fetching payment history" });
  }
});

module.exports = router;
