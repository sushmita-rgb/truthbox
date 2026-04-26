import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TruthBoxLogo from "../components/TruthBoxLogo";
import Footer from "../components/Footer";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Crown,
  Globe,
  LayoutTemplate,
  Lock,
  MessageSquare,
  MousePointerClick,
  Sparkles,
  Shield,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import heroArt from "../assets/hero.png";

const FEATURE_COLUMNS = [
  {
    title: "Anonymous by design",
    description: "Responses stay frictionless for visitors and easy to manage for creators.",
    icon: Shield,
  },
  {
    title: "Secure delivery",
    description: "JWT-authenticated dashboards, protected uploads, and terms gating for safety.",
    icon: Lock,
  },
  {
    title: "Useful feedback",
    description: "Turn raw opinions into structured responses you can actually act on.",
    icon: MessageSquare,
  },
];

const STEPS = [
  {
    title: "Create a link",
    description: "Choose a template, add branding, and publish a feedback page in seconds.",
    icon: Wand2,
  },
  {
    title: "Share anywhere",
    description: "Send it by bio link, DM, QR code, or embed it in your content.",
    icon: Globe,
  },
  {
    title: "Read the pattern",
    description: "Track responses, spot themes, and improve with data instead of guesswork.",
    icon: CheckCircle2,
  },
];

const TEMPLATES = [
  {
    id: "portfolio",
    title: "Portfolio review",
    summary: "Ask what stands out, what feels confusing, and what should be improved first.",
    accent: "#7c3aed",
    postType: "url",
    headline: "Make my portfolio clearer",
    prompt: "Which section is strongest, and where do you lose interest?",
    response: "The hero is strong, but the case studies need more proof.",
    note: "I want honest feedback on my portfolio and layout.",
  },
  {
    id: "content",
    title: "Content feedback",
    summary: "Test captions, posts, or newsletters before you publish them publicly.",
    accent: "#97ce23",
    postType: "text",
    headline: "Does this caption sound confident?",
    prompt: "What line feels too weak or too long?",
    response: "Shorten the first sentence and lead with the main promise.",
    note: "Help me improve this caption before I post it.",
  },
  {
    id: "launch",
    title: "Product launch",
    summary: "Collect blunt reactions before launch day and sharpen your messaging.",
    accent: "#f97316",
    postType: "text",
    headline: "Is this product message sharp enough?",
    prompt: "Would you immediately understand the value if you saw this in your feed?",
    response: "The benefit is clear, but the CTA can be more direct.",
    note: "I'm testing whether this launch message is clear enough.",
  },
  {
    id: "brand",
    title: "Personal brand",
    summary: "See how people describe your profile, tone, and online presence.",
    accent: "#38bdf8",
    postType: "image",
    headline: "What impression does this photo create?",
    prompt: "Does this profile image feel professional, friendly, or too casual?",
    response: "The image feels approachable, but the crop could be cleaner.",
    note: "Review my profile image and the impression it creates.",
  },
];

const reveal = {
  hidden: (direction) => ({
    opacity: 0,
    x: direction * 88,
    y: 30,
    filter: "blur(8px)",
  }),
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

function ZigzagSection({ id, flip = false, left, right }) {
  return (
    <section id={id} className="w-full px-6 py-16 lg:px-12 2xl:px-20 xl:py-24">
      <div className="grid min-h-[82vh] items-center gap-10 xl:grid-cols-[1fr_1fr]">
        <motion.div
          custom={flip ? 1 : -1}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.24 }}
          variants={reveal}
          className={flip ? "xl:order-2" : ""}
        >
          {left}
        </motion.div>
        <motion.div
          custom={flip ? -1 : 1}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.24 }}
          variants={reveal}
          className={flip ? "xl:order-1" : ""}
        >
          {right}
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0]);
  const [demoNote, setDemoNote] = useState(TEMPLATES[0].note);

  const statTiles = useMemo(
    () => [
      { value: "30 sec", label: "to publish a link" },
      { value: "100%", label: "anonymous responses" },
      { value: "5 min", label: "to launch a branded page" },
    ],
    []
  );

  const handleTemplateSelect = (template) => {
    setActiveTemplate(template);
    setDemoNote(template.note);
    localStorage.setItem("truthbox.selectedTemplate", JSON.stringify(template));
  };

  const continueWithTemplate = () => {
    localStorage.setItem("truthbox.selectedTemplate", JSON.stringify(activeTemplate));
    navigate("/signup");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(151,206,35,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.58))]" />

      <header className="relative z-10 w-full border-b border-white/10">
        <div className="flex w-full items-center justify-between px-6 py-6 lg:px-12 2xl:px-20">
          <Link to="/" className="flex items-center">
            <TruthBoxLogo className="h-16 w-auto" showTagline={false} />
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <a href="#how-it-works" className="text-sm text-gray-300 transition-colors hover:text-white">
              How it works
            </a>
            <a href="#templates" className="text-sm text-gray-300 transition-colors hover:text-white">
              Templates
            </a>
            <a href="#pricing" className="text-sm text-gray-300 transition-colors hover:text-white">
              Pricing
            </a>
            <Link
              to="/login"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-main transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(151,206,35,0.35)]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full">
        <ZigzagSection
          left={
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-300">
                <MousePointerClick size={14} className="text-accent" />
                Built for honest, anonymous feedback
              </div>

              <div className="space-y-5">
                <h2 className="max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl xl:text-[5.2rem]">
                  Make feedback feel
                  <span className="text-accent"> premium</span>,
                  not basic.
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-gray-300 md:text-xl">
                  TruthBox helps creators, students, and builders collect anonymous feedback through
                  branded links, useful templates, and a dashboard that actually tells them what to do next.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-bold text-main transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(151,206,35,0.35)]"
                >
                  Create your first link
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#live-demo"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Try the live demo
                  <ChevronRight size={16} />
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {statTiles.map((tile) => (
                  <div key={tile.label} className="rounded-3xl border border-white/10 bg-black/35 px-5 py-4 backdrop-blur-xl">
                    <p className="text-2xl font-extrabold text-white">{tile.value}</p>
                    <p className="text-sm text-gray-500">{tile.label}</p>
                  </div>
                ))}
              </div>
            </div>
          }
          right={
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              {FEATURE_COLUMNS.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-gray-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          }
        />

        <ZigzagSection
          id="live-demo"
          flip
          left={
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Live Demo</p>
              <h3 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
                See the feedback page update as you pick templates.
              </h3>
              <p className="max-w-xl text-base leading-8 text-gray-400 md:text-lg">
                This block is fully active: selecting template chips updates the preview instantly,
                and your selected template is carried into signup and dashboard.
              </p>
            </div>
          }
          right={
            <div className="relative w-full">
              <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute -right-6 bottom-12 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(10,10,10,0.82)] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div className="grid gap-0 border-b border-white/10 bg-white/5 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl border border-white/10 bg-black/50 p-2">
                        <img src={heroArt} alt="TruthBox preview" className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Live preview</p>
                        <h3 className="text-2xl font-bold leading-tight">How a feedback page feels</h3>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-3xl border border-white/10 bg-black/45 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-3xl font-bold leading-tight text-white">{activeTemplate.headline}</p>
                          <p className="text-sm text-gray-500">Anonymous response preview</p>
                        </div>
                        <div className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${activeTemplate.accent}20`, color: activeTemplate.accent }}>
                          {activeTemplate.title}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/60 p-4 text-sm text-gray-300">
                        {activeTemplate.prompt}
                      </div>

                      <textarea
                        value={demoNote}
                        onChange={(e) => setDemoNote(e.target.value)}
                        className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-accent/50"
                        placeholder="Write your response here..."
                      />

                      <div className="rounded-2xl border p-4" style={{ background: `${activeTemplate.accent}10`, borderColor: `${activeTemplate.accent}26` }}>
                        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: activeTemplate.accent }}>
                          Example reply
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-200">{activeTemplate.response}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 p-6 md:border-l md:border-t-0">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {TEMPLATES.map((template) => {
                        const active = template.id === activeTemplate.id;
                        return (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                              active
                                ? "bg-accent text-main"
                                : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                            }`}
                          >
                            {template.title}
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Selected template</p>
                        <h4 className="mt-3 text-xl font-bold">{activeTemplate.title}</h4>
                        <p className="mt-2 text-sm leading-7 text-gray-400">{activeTemplate.summary}</p>
                      </div>

                      <div className="grid gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Current note</p>
                          <p className="mt-2 text-sm text-gray-200">{demoNote}</p>
                        </div>
                        <button
                          onClick={continueWithTemplate}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold text-main"
                          style={{ background: activeTemplate.accent }}
                        >
                          Use this template
                          <Copy size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <ZigzagSection
          id="how-it-works"
          left={
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">How it works</p>
              <h3 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
                Three steps from idea to insight.
              </h3>
              <p className="max-w-xl text-base leading-8 text-gray-400 md:text-lg">
                Every step is simple by itself, but together they create a feedback loop that feels professional.
              </p>
            </div>
          }
          right={
            <div className="grid gap-5 lg:grid-cols-3 xl:grid-cols-1">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                        <Icon size={22} />
                      </div>
                      <span className="text-sm text-gray-600">0{index + 1}</span>
                    </div>
                    <h4 className="text-xl font-bold">{step.title}</h4>
                    <p className="mt-3 text-sm leading-7 text-gray-400">{step.description}</p>
                  </div>
                );
              })}
            </div>
          }
        />

        <ZigzagSection
          id="templates"
          flip
          left={
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Templates</p>
              <h3 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
                Start with a strong prompt instead of a blank screen.
              </h3>
              <p className="max-w-xl text-base leading-8 text-gray-400 md:text-lg">
                Select any card and it becomes active immediately in the live preview and onboarding flow.
              </p>
            </div>
          }
          right={
            <div className="grid gap-5 md:grid-cols-2">
              {TEMPLATES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTemplateSelect(item)}
                  className={`rounded-[1.75rem] border p-6 text-left transition-all hover:-translate-y-1 hover:bg-white/10 ${
                    activeTemplate.id === item.id
                      ? "border-accent/60 bg-accent/10 shadow-[0_0_0_1px_rgba(151,206,35,0.3)]"
                      : "border-white/10 bg-[#111111]"
                  }`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.accent }} />
                    <LayoutTemplate size={18} style={{ color: item.accent }} />
                  </div>
                  <h4 className="text-xl font-bold">{item.title}</h4>
                  <p className="mt-3 text-sm leading-7 text-gray-400">{item.summary}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: item.accent }}>
                    {activeTemplate.id === item.id ? "Selected" : "Use template"}
                    <ChevronRight size={15} />
                  </div>
                </button>
              ))}
            </div>
          }
        />

        {/* ── Pricing Section ───────────────────────────────────────────── */}
        <section id="pricing" className="w-full px-6 pb-28 pt-10 lg:px-12 2xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-14"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Pricing</p>
            <h3 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold md:text-5xl">
              Simple plans, honest prices.
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-400">
              Start free. Upgrade when you're ready to scale your feedback operation.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                id: "free",
                name: "Free",
                price: "₹0",
                subPrice: null,
                period: "forever",
                icon: Sparkles,
                color: "#6b7280",
                links: "5 links",
                features: [
                  "5 feedback links",
                  "All post types",
                  "Anonymous responses",
                  "Basic dashboard",
                ],
                locked: ["Analytics", "CSV export", "Priority support"],
                cta: "Get started free",
                href: "/signup",
                ctaStyle: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
                badge: null,
                glow: null,
              },
              {
                id: "pro",
                name: "Pro",
                price: "₹499",
                subPrice: "≈ $6",
                period: "per month",
                icon: Zap,
                color: "#97ce23",
                links: "20 links",
                features: [
                  "20 feedback links",
                  "All post types",
                  "Anonymous responses",
                  "Full analytics dashboard",
                  "CSV export",
                  "Priority support",
                ],
                locked: ["Custom branding"],
                cta: "Get Pro — ₹499/mo",
                href: "/signup?plan=pro",
                ctaStyle: "bg-accent text-black font-bold hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(151,206,35,0.45)]",
                badge: "Most Popular",
                glow: "0 0 60px rgba(151,206,35,0.20)",
              },
              {
                id: "ultra",
                name: "Pro Ultra",
                price: "₹999",
                subPrice: "≈ $12",
                period: "per month",
                icon: Crown,
                color: "#ffffff",
                links: "Unlimited",
                features: [
                  "Unlimited feedback links",
                  "All post types",
                  "Anonymous responses",
                  "Full analytics dashboard",
                  "CSV export",
                  "Priority support",
                  "Custom branding",
                  "Early access to features",
                ],
                locked: [],
                cta: "Get Ultra — ₹999/mo",
                href: "/signup?plan=ultra",
                ctaStyle: "bg-white text-black font-bold hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]",
                badge: "Best Value",
                glow: "0 0 60px rgba(255,255,255,0.10)",
              },
            ].map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                  className="relative rounded-[1.75rem] border p-7 flex flex-col gap-5"
                  style={{
                    borderColor: plan.id === "pro" ? "rgba(151,206,35,0.4)" : plan.id === "ultra" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
                    background: plan.id === "pro" ? "rgba(151,206,35,0.05)" : "rgba(255,255,255,0.02)",
                    boxShadow: plan.glow || "none",
                  }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                      style={{ background: plan.color, color: "#000" }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Icon + name */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}30` }}
                    >
                      <Icon size={20} style={{ color: plan.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{plan.name}</p>
                      <p className="text-xs text-gray-500">{plan.links}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="border-b border-white/8 pb-5">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-sm text-gray-500 ml-2">/{plan.period}</span>
                    {plan.subPrice && (
                      <p className="text-xs text-gray-600 mt-1">{plan.subPrice} approx.</p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                        <Check size={15} style={{ color: plan.color, flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                    {plan.locked.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <X size={15} className="text-gray-700 shrink-0" />
                        <span className="line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    to={plan.href}
                    className={`w-full py-3.5 rounded-2xl text-sm text-center transition-all inline-flex items-center justify-center gap-2 ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                    <ArrowRight size={15} />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-600 mt-10">
            All plans include anonymous responses. No credit card required for Free.
            Questions? <a href="mailto:support@truthbox.app" className="text-accent hover:underline">Contact us</a>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
