import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, Crown, Sparkles, ArrowRight, Lock } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
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
    price: "$10",
    period: "per month",
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
    price: "$20",
    period: "per month",
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

export default function PricingModal({ onClose, currentPlan = "free", used = 0, limit = 5 }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(18px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 md:p-10 overflow-hidden"
        >
          {/* Background accent glow */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(ellipse, rgba(151,206,35,0.12) 0%, transparent 70%)" }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent mb-4">
              <Lock size={12} />
              Link limit reached
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              You've used <span className="text-accent">{used}</span> of{" "}
              <span className="text-accent">{limit}</span> free links
            </h2>
            <p className="mt-3 text-gray-400 text-base max-w-xl mx-auto">
              Upgrade your plan to keep creating feedback links and unlock powerful features.
            </p>

            {/* Usage bar */}
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
          </div>

          {/* Plan cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon;
              const isCurrent = plan.id === currentPlan;
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
                      style={{ background: plan.color, color: plan.id === "ultra" ? "#000" : "#000" }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Icon + name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
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
                  <div>
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-sm text-gray-500 ml-1">/{plan.period}</span>
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
                    disabled={isCurrent || plan.ctaDisabled}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? "border border-white/10 text-gray-600 cursor-default"
                        : plan.id === "ultra"
                        ? "bg-white text-black hover:bg-gray-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        : "text-black hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(151,206,35,0.4)]"
                    }`}
                    style={!isCurrent && plan.id !== "ultra" ? { background: plan.color } : {}}
                    onClick={() => {
                      if (!isCurrent && !plan.ctaDisabled) {
                        alert(`Upgrade to ${plan.name} coming soon! Contact us to upgrade early.`);
                      }
                    }}
                  >
                    {isCurrent ? "Current plan" : (
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
            <a href="mailto:support@truthbox.app" className="text-accent hover:underline">Contact support</a>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
