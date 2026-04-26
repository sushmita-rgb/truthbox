import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle,
  Loader2,
  IndianRupee,
} from "lucide-react";
import api from "../api";

// ── Plan definitions (INR) ──────────────────────────────────────────────────
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    priceNote: "forever",
    icon: Sparkles,
    color: "#6b7280",
    glow: "rgba(107,114,128,0.25)",
    links: 5,
    features: [
      "5 feedback links",
      "All post types (text, image, PDF, video, URL)",
      "Anonymous responses",
      "Basic dashboard",
    ],
    locked: ["Priority support", "CSV export", "Custom branding", "Analytics"],
    cta: "Current plan",
    ctaDisabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    priceNote: "per month",
    icon: Zap,
    color: "#97ce23",
    glow: "rgba(151,206,35,0.30)",
    links: 20,
    badge: "Most Popular",
    features: [
      "20 feedback links",
      "All post types",
      "Anonymous responses",
      "Full analytics dashboard",
      "CSV export",
      "Priority support",
    ],
    locked: ["Unlimited links", "Custom branding"],
    cta: "Upgrade to Pro",
    ctaDisabled: false,
  },
  {
    id: "ultra",
    name: "Pro Ultra",
    price: "₹999",
    priceNote: "per month",
    icon: Crown,
    color: "#ffffff",
    glow: "rgba(255,255,255,0.20)",
    links: "Unlimited",
    badge: "Best Value",
    features: [
      "Unlimited feedback links",
      "All post types",
      "Anonymous responses",
      "Full analytics dashboard",
      "CSV export",
      "Priority support",
      "Custom branding & accent colors",
      "Early access to new features",
    ],
    locked: [],
    cta: "Upgrade to Ultra",
    ctaDisabled: false,
  },
];

// Dynamically load the Razorpay checkout script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingModal({
  onClose,
  currentPlan = "free",
  used = 0,
  limit = 5,
  onUpgradeSuccess,
}) {
  const [loadingPlan, setLoadingPlan] = useState(null); // which plan's button is spinning
  const [successPlan, setSuccessPlan]  = useState(null); // which plan just succeeded
  const [error, setError]              = useState(null);

  const initiatePayment = async (plan) => {
    setError(null);
    setLoadingPlan(plan.id);

    try {
      // 1. Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        throw new Error("Failed to load the Razorpay checkout. Please check your internet connection.");
      }

      // 2. Create order on our backend
      const { data: order } = await api.post("/payment/create-order", { plan: plan.id });

      // 3. Open Razorpay checkout modal
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         order.keyId,
          amount:      order.amount,
          currency:    order.currency,
          name:        "TruthBox",
          description: `${order.planName} Plan — Monthly`,
          order_id:    order.orderId,
          theme:       { color: plan.color === "#ffffff" ? "#97ce23" : plan.color },
          modal: {
            ondismiss: () => reject(new Error("Payment was cancelled.")),
          },
          handler: async (response) => {
            try {
              // 4. Verify payment on our backend
              const { data: verified } = await api.post("/payment/verify", {
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              setSuccessPlan(plan.id);

              // 5. Notify the parent (Dashboard) to refresh plan + usage
              if (onUpgradeSuccess) {
                onUpgradeSuccess(verified.user);
              }

              resolve();
            } catch (verifyErr) {
              reject(verifyErr);
            }
          },
        });

        rzp.on("payment.failed", (response) => {
          reject(new Error(response.error?.description || "Payment failed."));
        });

        rzp.open();
      });
    } catch (err) {
      // Don't show an error if the user simply closed the modal
      if (err?.message && !err.message.toLowerCase().includes("cancel")) {
        setError(err.response?.data?.message || err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(18px)" }}
        onClick={(e) => e.target === e.currentTarget && !loadingPlan && onClose()}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 md:p-10 overflow-hidden"
        >
          {/* Background accent glow */}
          <div
            className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(ellipse, rgba(151,206,35,0.12) 0%, transparent 70%)" }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            disabled={!!loadingPlan}
            className="absolute top-5 right-5 w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>

          {/* ── Success banner ── */}
          <AnimatePresence>
            {successPlan && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 flex items-center gap-3 rounded-2xl border border-[#97ce23]/30 bg-[#97ce23]/10 px-5 py-4"
              >
                <CheckCircle size={20} className="text-[#97ce23] shrink-0" />
                <div>
                  <p className="font-bold text-white text-sm">Payment successful! 🎉</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your plan has been upgraded to{" "}
                    <span className="text-[#97ce23] font-semibold">
                      {PLANS.find((p) => p.id === successPlan)?.name}
                    </span>
                    . You can now create more feedback links.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="ml-auto px-4 py-2 rounded-xl bg-[#97ce23] text-black text-xs font-bold hover:bg-[#b0e832] transition-colors shrink-0"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error banner ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3"
              >
                <X size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300 shrink-0"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Header ── */}
          {!successPlan && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent mb-4">
                <Lock size={12} />
                {currentPlan === "free" && used >= limit
                  ? "Link limit reached"
                  : "Upgrade your plan"}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {currentPlan === "free" && used >= limit ? (
                  <>
                    You&apos;ve used <span className="text-accent">{used}</span> of{" "}
                    <span className="text-accent">{limit}</span> free links
                  </>
                ) : (
                  "Unlock more with a premium plan"
                )}
              </h2>
              <p className="mt-3 text-gray-400 text-base max-w-xl mx-auto">
                Upgrade your plan to keep creating feedback links and unlock powerful features.
              </p>

              {/* Usage bar */}
              {currentPlan === "free" && (
                <div className="mt-5 mx-auto max-w-xs">
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #97ce23, #c8f563)" }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{used} / {limit} links used</p>
                </div>
              )}
            </div>
          )}

          {/* ── Plan cards ── */}
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon;
              const isCurrent  = plan.id === currentPlan;
              const isLoading  = loadingPlan === plan.id;
              const isSuccess  = successPlan === plan.id;
              const anyLoading = !!loadingPlan;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" }}
                  className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-all ${
                    isCurrent
                      ? "border-white/10 bg-white/3"
                      : plan.id === "pro"
                      ? "border-accent/40 bg-accent/5"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                  style={!isCurrent ? { boxShadow: `0 0 40px ${plan.glow}` } : {}}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: plan.color, color: "#000" }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Icon + name */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}30` }}
                    >
                      <Icon size={18} style={{ color: plan.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">{plan.name}</p>
                      <p className="text-xs text-gray-500">{plan.links} links</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-1">
                    <IndianRupee size={16} className="text-white mb-1 shrink-0" />
                    <span className="text-3xl font-extrabold text-white leading-none">
                      {plan.price.replace("₹", "")}
                    </span>
                    <span className="text-sm text-gray-500 ml-1 mb-0.5">/{plan.priceNote}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check size={14} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                        {f}
                      </li>
                    ))}
                    {plan.locked.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600 line-through">
                        <X size={14} className="mt-0.5 shrink-0 text-gray-700" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    disabled={isCurrent || plan.ctaDisabled || anyLoading || isSuccess}
                    onClick={() => !isCurrent && !plan.ctaDisabled && !anyLoading && !isSuccess && initiatePayment(plan)}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      isCurrent || isSuccess
                        ? "border border-white/10 text-gray-500 cursor-default"
                        : plan.id === "ultra"
                        ? "bg-white text-black hover:bg-gray-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                        : "text-black hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(151,206,35,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                    style={
                      !isCurrent && !isSuccess && plan.id !== "ultra"
                        ? { background: plan.color }
                        : {}
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Processing…
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle size={14} className="text-[#97ce23]" />
                        <span className="text-[#97ce23]">Activated!</span>
                      </>
                    ) : isCurrent ? (
                      "Current plan"
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            Plans auto-renew monthly. Cancel anytime. Questions?{" "}
            <a href="mailto:support@truthbox.app" className="text-accent hover:underline">
              Contact support
            </a>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
