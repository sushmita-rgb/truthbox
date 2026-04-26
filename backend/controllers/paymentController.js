const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const User = require("../models/User");

// ── Plan pricing (INR, stored in paise: 1 INR = 100 paise) ──────────────────
const PLAN_PRICES = {
  pro:   { amount: 10 * 100 * 83, label: "Verit Pro"   }, // $10 ≈ ₹830
  ultra: { amount: 20 * 100 * 83, label: "Verit Ultra" }, // $20 ≈ ₹1660
};

// Lazily initialise Razorpay so startup doesn't crash if keys are placeholders
const getRazorpay = () => {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes("XXXX")) {
    throw new Error(
      "Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file."
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/create-order
// Creates a Razorpay order and saves a pending Payment record in MongoDB.
// ─────────────────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId   = req.user.id;

    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({ message: "Invalid plan. Choose 'pro' or 'ultra'." });
    }

    const razorpay = getRazorpay();
    const { amount, label } = PLAN_PRICES[plan];

    // Create order on Razorpay
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rct_${userId.toString().slice(-6)}_${Date.now()}`,
      notes: { plan, userId: userId.toString() },
    });

    // Persist a "created" payment record so we can verify later
    const payment = new Payment({
      userId,
      plan,
      razorpayOrderId: order.id,
      amount,
      currency: "INR",
      status: "created",
    });
    await payment.save();

    return res.status(201).json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID, // safe to expose key_id (NOT secret)
      plan,
      label,
    });
  } catch (err) {
    console.error("❌ createOrder error:", err.message);
    return res.status(500).json({ message: err.message || "Failed to create payment order." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/verify
// Verifies the Razorpay payment signature. On success upgrades the user's plan.
// ─────────────────────────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const userId = req.user.id;

    // ── 1. Validate required fields ──────────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields." });
    }

    // ── 2. Re-compute expected signature ────────────────────────────────────
    //    Razorpay signature = HMAC-SHA256(orderId + "|" + paymentId, keySecret)
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected  = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      // Signature mismatch → mark payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id, userId },
        { status: "failed" }
      );
      return res.status(400).json({ message: "Payment verification failed: invalid signature." });
    }

    // ── 3. Update payment record in DB ───────────────────────────────────────
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, userId },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found." });
    }

    // ── 4. Upgrade the user's plan ───────────────────────────────────────────
    const upgradedUser = await User.findByIdAndUpdate(
      userId,
      { plan: plan || payment.plan },
      { new: true }
    ).select("username email plan");

    return res.status(200).json({
      message: "Payment verified. Plan upgraded successfully!",
      plan:    upgradedUser.plan,
      payment: {
        orderId:   payment.razorpayOrderId,
        paymentId: payment.razorpayPaymentId,
        status:    payment.status,
        amount:    payment.amount,
      },
    });
  } catch (err) {
    console.error("❌ verifyPayment error:", err.message);
    return res.status(500).json({ message: "Server error during payment verification." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/history
// Returns the logged-in user's payment history.
// ─────────────────────────────────────────────────────────────────────────────
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json(payments);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch payment history." });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory };
