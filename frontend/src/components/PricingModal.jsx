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
    color: "var(--text-muted)",
    glow: "rgba(148,163,184,0.1)",
    links: 5,
    features: [
      "5 feedback links",
      "All post types (text, image, video, URL)",
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
    color: "var(--accent)",
    glow: "rgba(59,130,246,0.15)",
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
    color: "var(--text-primary)",
    glow: "rgba(15,23,42,0.1)",
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
  user,
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
          name:        "Verit",
          description: `${order.planName} Plan — Monthly`,
          order_id:    order.orderId,
          theme:       { color: plan.color === "#ffffff" ? "#97ce23" : plan.color },
          prefill: {
            email: user?.email || "",
            contact: "9999999999" // Pre-filled so the checkout skips directly to payment methods (showing UPI)
          },
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-colors duration-500"
        onClick={(e) => e.target === e.currentTarget && !loadingPlan && onClose()}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 md:p-10 overflow-hidden shadow-2xl transition-colors duration-500"
        >
          {/* Background accent glow */}
          <div
            className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(ellipse, rgba(151,206,35,0.12) 0%, transparent 70%)" }}
          />

          <div className="flex justify-between items-center mb-8 border-b border-[var(--border-color)] pb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Upgrade Plan</h2>
              <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">Choose the perfect plan for your needs.</p>
            </div>
            <button
              onClick={onClose}
              disabled={!!loadingPlan}
              className="w-10 h-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Success banner ── */}
          <AnimatePresence>
            {successPlan && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 flex items-center gap-3 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-5 py-4"
              >
                <CheckCircle size={20} className="text-[var(--accent)] shrink-0" />
                <div>
                  <p className="font-bold text-[var(--text-primary)] text-sm">Payment successful! 🎉</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Your plan has been upgraded to{" "}
                    <span className="text-[var(--accent)] font-semibold">
                      {PLANS.find((p) => p.id === successPlan)?.name}
                    </span>
                    . You can now create more feedback links.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="ml-auto px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-90 transition-all shrink-0 shadow-lg shadow-[var(--accent)]/20"
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
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
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
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent mb-4">
                <Lock size={12} />
                {currentPlan === "free" && used >= limit
                  ? "Link limit reached"
                  : "Upgrade your plan"}
              </div>
              
              {/* Usage bar */}
              {currentPlan === "free" && (
                <div className="mt-5 mx-auto max-w-xs">
                  <div className="h-2 w-full rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                      className="h-full rounded-full bg-[var(--accent)]"
                    />
                  </div>
                  <p className="mt-2 text-xs font-bold text-[var(--text-muted)] tracking-widest uppercase">{used} / {limit} links used</p>
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
                      ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
                      : plan.id === "pro"
                      ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
                      : "border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--border-color)]/80"
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
                      <p className="font-bold text-[var(--text-primary)] text-base">{plan.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{plan.links} links</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-1">
                    <IndianRupee size={16} className="text-[var(--text-primary)] mb-1 shrink-0" />
                    <span className="text-3xl font-extrabold text-[var(--text-primary)] leading-none">
                      {plan.price.replace("₹", "")}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)] ml-1 mb-0.5">/{plan.priceNote}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
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
                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      isCurrent || isSuccess
                        ? "border border-[var(--border-color)] text-[var(--text-muted)] cursor-default"
                        : plan.id === "ultra"
                        ? "bg-[var(--text-primary)] text-[var(--bg-secondary)] hover:opacity-90 shadow-lg shadow-[var(--text-primary)]/10"
                        : "bg-[var(--accent)] text-white hover:opacity-90 shadow-lg shadow-[var(--accent)]/10"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Processing…
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle size={14} />
                        <span>Activated!</span>
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
            <a href="mailto:support@Verit.app" className="text-accent hover:underline">
              Contact support
            </a>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
