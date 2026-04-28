import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import VeritLogo from "../components/VeritLogo";
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
  Menu,
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
    title: "1. Create your anonymous link",
    description: "Sign up and instantly generate a beautifully branded TruthBox link. Customize the template to ask the exact right questions for your audience.",
    icon: Wand2,
  },
  {
    title: "2. Share with your audience",
    description: "Drop your link in your Instagram bio, Twitter profile, or send it directly via DM. Anyone can respond effortlessly without logging in.",
    icon: Globe,
  },
  {
    title: "3. Get honest, structured feedback",
    description: "View responses in a private, secure dashboard. Track patterns, filter the noise, and gain actionable insights from raw, authentic honesty.",
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

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
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



// ... existing code (FEATURE_COLUMNS, STEPS, TEMPLATES, reveal, ZigzagSection)

import lightCloudBg from "../assets/light_cloud_bg.png";
import darkCloudBg from "../assets/dark_cloud_bg.png";

export default function Home() {
  const navigate = useNavigate();
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0]);
  const [demoNote, setDemoNote] = useState(TEMPLATES[0].note);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuLinks = [
    { name: "How it works", href: "#how-it-works" },
    { name: "Templates", href: "#templates" },
    { name: "Pricing", href: "#pricing" },
  ];

  const statTiles = useMemo(
    () => [
      { value: "30 sec", label: "to publish a link" },
      { value: "100%", label: "anonymous" },
      { value: "5 min", label: "to launch" },
    ],
    []
  );

  const handleTemplateSelect = (template) => {
    setActiveTemplate(template);
    setDemoNote(template.note);
    localStorage.setItem("verit.selectedTemplate", JSON.stringify(template));
  };

  const continueWithTemplate = () => {
    localStorage.setItem("verit.selectedTemplate", JSON.stringify(activeTemplate));
    navigate("/signup");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--accent-soft),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(151,206,35,0.05),transparent_30%)]" />
      <div 
        className="absolute inset-0 pointer-events-none z-0 dark:hidden" 
        style={{ 
          backgroundImage: `url(${lightCloudBg})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 1 
        }} 
      />
      <div 
        className="absolute inset-0 pointer-events-none z-0 hidden dark:block" 
        style={{ 
          backgroundImage: `url(${darkCloudBg})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 1 
        }} 
      />

      <header className="relative z-[100] w-full border-b border-[var(--border-color)]">
        <div className="flex w-full items-center justify-between px-6 py-4 lg:py-6 lg:px-12 2xl:px-20">
          <Link to="/" className="flex items-center">
            <VeritLogo className="h-16 lg:h-20 w-auto" showTagline={false} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {menuLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                {link.name}
              </a>
            ))}
            <div className="h-6 w-px bg-[var(--border-color)] mx-2" />
            <Link
              to="/login"
              className="text-sm font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] text-[var(--text-primary)]"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] md:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-72 bg-[var(--bg-secondary)] border-l border-[var(--border-color)] flex flex-col py-6 px-6 gap-6 z-[120] md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex flex-col gap-2 mt-4">
                {menuLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] py-2"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
              
              <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-[var(--border-color)]">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl border border-[var(--border-color)] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-all"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-[var(--accent)] font-bold text-white shadow-lg transition-all"
                >
                  Get started
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="relative z-10 w-full">
        <ZigzagSection
          left={
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] shadow-sm">
                <MousePointerClick size={14} className="text-[var(--accent)]" />
                Professional anonymous feedback
              </div>

              <div className="space-y-5">
                <h2 className="max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl xl:text-[5.5rem] text-[var(--text-primary)]">
                  Make feedback feel
                  <span className="text-[var(--accent)]"> premium</span>
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)] md:text-xl">
                  TruthBox helps creators and builders collect anonymous feedback through
                  branded links and a dashboard that actually provides insights.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-7 py-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 shadow-lg shadow-[var(--accent)]/20"
                >
                  Create your first link
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#live-demo"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-7 py-4 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]/80"
                >
                  Try live demo
                  <ChevronRight size={16} />
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {statTiles.map((tile) => (
                  <div key={tile.label} className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 px-5 py-4 backdrop-blur-xl">
                    <p className="text-2xl font-extrabold text-[var(--text-primary)]">{tile.value}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{tile.label}</p>
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
                  <div key={feature.title} className="rounded-[1.6rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/40 p-6 backdrop-blur-xl group hover:bg-[var(--bg-secondary)]/80 transition-all">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{feature.description}</p>
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
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent)]">Live Demo</p>
              <h3 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl text-[var(--text-primary)]">
                Real-time template preview.
              </h3>
              <p className="max-w-xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
                Choose a template and see how your feedback page will look to your visitors instantly.
              </p>
            </div>
          }
          right={
            <div className="relative w-full">
              <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-[var(--accent)]/20 blur-3xl" />
              
              <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 shadow-2xl backdrop-blur-xl">
                {/* Browser-like Header */}
                <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                  <div className="ml-4 flex-1 rounded-md bg-[var(--bg-secondary)] py-1.5 px-3 text-xs text-[var(--text-secondary)] text-center border border-[var(--border-color)] shadow-sm font-mono">
                    truthbox.io/p/preview
                  </div>
                </div>
                <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="p-8 border-b md:border-b-0 md:border-r border-[var(--border-color)]">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-[var(--bg-primary)] p-2 border border-[var(--border-color)] shadow-sm">
                        <img src={heroArt} alt="Verit preview" className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">Live Preview</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Interact with the template</p>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6">
                      <p className="text-2xl font-bold text-[var(--text-primary)]">{activeTemplate.headline}</p>
                      <textarea
                        value={demoNote}
                        onChange={(e) => setDemoNote(e.target.value)}
                        className="min-h-24 w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                        placeholder="Write something..."
                      />
                      <div className="rounded-2xl p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/10">
                        <p className="text-xs font-bold uppercase text-[var(--accent)] mb-1">Example Reply</p>
                        <p className="text-sm text-[var(--text-secondary)]">{activeTemplate.response}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-[var(--bg-primary)]/30">
                    <div className="mb-6 flex flex-wrap gap-2">
                      {TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                            template.id === activeTemplate.id
                              ? "bg-[var(--accent)] text-white shadow-md"
                              : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/80"
                          }`}
                        >
                          {template.title}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={continueWithTemplate}
                      className="w-full py-4 rounded-2xl text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] bg-[var(--accent)] hover:bg-[var(--accent)]/90"
                    >
                      Use this template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <section id="how-it-works" className="w-full px-6 py-20 lg:px-12 2xl:px-20 relative">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="text-center mb-16 max-w-3xl mx-auto space-y-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent)]">How it works</p>
            <h3 className="text-4xl font-extrabold text-[var(--text-primary)] md:text-6xl">Simple and professional.</h3>
            <p className="text-lg text-[var(--text-secondary)]">Get up and running in less than a minute. No complex setups, just clear, honest feedback from your audience.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto relative"
          >
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent z-0" />
            
            {STEPS.map((step, index) => (
              <motion.div 
                key={step.title} 
                variants={fadeUp}
                className="relative z-10 rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--accent)]/5 blur-2xl group-hover:bg-[var(--accent)]/10 transition-colors" />
                
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--accent)]/10 text-[var(--accent)] shadow-inner">
                  <step.icon size={28} />
                </div>
                
                <h4 className="text-xl font-bold text-[var(--text-primary)] mb-3">{step.title}</h4>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Pricing Section ───────────────────────────────────────────── */}
        <section id="pricing" className="w-full px-6 pb-28 pt-10 lg:px-12 2xl:px-20">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent)]">Pricing</p>
            <h3 className="mt-4 text-4xl font-extrabold text-[var(--text-primary)] md:text-5xl">Simple plans.</h3>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto"
          >
            {[
              { id: "free", name: "Free", price: "₹0", color: "#6b7280", features: ["5 links", "All post types", "Basic dashboard"] },
              { id: "pro", name: "Pro", price: "₹499", color: "var(--accent)", features: ["20 links", "Analytics", "Priority support"], popular: true },
              { id: "ultra", name: "Ultra", price: "₹999", color: "#38bdf8", features: ["Unlimited links", "Custom branding", "Early access"] },
            ].map((plan) => (
              <motion.div 
                key={plan.id}
                variants={fadeUp}
                className={`relative rounded-[2.5rem] border p-8 flex flex-col gap-6 transition-all hover:shadow-2xl ${
                  plan.popular ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-105" : "border-[var(--border-color)] bg-[var(--bg-secondary)]/50"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest rounded-full">Popular</span>
                )}
                <div>
                  <h4 className="text-2xl font-bold text-[var(--text-primary)]">{plan.name}</h4>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[var(--text-primary)]">{plan.price}</span>
                    <span className="text-sm text-[var(--text-secondary)]">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <Check size={18} className="text-[var(--accent)]" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={`w-full py-4 rounded-2xl text-sm font-bold text-center transition-all ${
                  plan.popular ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                }`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
