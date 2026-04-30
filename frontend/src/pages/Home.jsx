import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import VeritLogo from "../components/VeritLogo";
import Footer from "../components/Footer";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CheckCircle,
  Globe,
  Layout,
  Mail,
  Menu,
  MessageSquare,
  Play,
  Shield,
  Sparkles,
  Star,
  User,
  X,
  Sun,
  Moon,
  ChevronRight,
  Copy,
  Crown,
  LayoutTemplate,
  Lock,
  MousePointerClick,
  Wand2,
  Zap,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
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
  const { theme, toggleTheme } = useTheme();
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
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-500">
      {/* Global Atmospheric Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Base Layer - Theme Aware */}
        <div className="absolute inset-0 bg-[var(--bg-primary)] transition-colors duration-500" />
        
        {/* Subtle Accent Glows */}
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[radial-gradient(circle_at_top_right,var(--accent-soft),transparent_70%)] opacity-70" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-[radial-gradient(circle_at_bottom_left,var(--accent-soft),transparent_70%)] opacity-50" />
        
        {/* Global Cloud Texture - Continuous from top to bottom */}
        <div className="absolute inset-0 opacity-40 dark:opacity-60 transition-opacity duration-500">
          <img 
            src={theme === "dark" ? darkCloudBg : lightCloudBg} 
            alt="" 
            className="w-full h-full object-cover blur-[1px] scale-105"
            style={{ 
              mixBlendMode: theme === "dark" ? 'screen' : 'multiply',
              filter: theme === "dark" ? 'brightness(1.1)' : 'none'
            }}
          />
        </div>
      </div>

      <header className="relative z-[100] w-full border-b border-[var(--border-color)] backdrop-blur-md bg-transparent sticky top-0">
        <div className="flex w-full items-center justify-between px-6 py-4 lg:py-6 lg:px-12 2xl:px-20">
          <Link to="/" className="flex items-center">
            <VeritLogo className="h-16 lg:h-20 w-auto" showTagline={false} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {menuLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                {link.name}
              </a>
            ))}
            <div className="h-4 w-px bg-[var(--border-color)] mx-2" />
            <Link
              to="/login"
              className="text-sm font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="btn-primary !py-2.5 !px-6 !text-sm"
            >
              Get started
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-all shadow-sm"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] text-[var(--text-primary)]"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
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
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)] shadow-sm">
                <Sparkles size={14} className="animate-pulse" />
                The new standard for feedback
              </div>

              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl xl:text-[6rem] text-[var(--text-primary)]">
                  Make feedback feel
                  <span className="text-[var(--accent)]"> premium.</span>
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl font-medium">
                  TruthBox helps creators and builders collect anonymous feedback through
                  high-end branded links and a dashboard that actually provides insights.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  to="/signup"
                  className="btn-primary !px-8 !py-4 text-base"
                >
                  Get started for free
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#live-demo"
                  className="btn-secondary !px-8 !py-4 text-base"
                >
                  View demo
                  <Play size={18} className="fill-current" />
                </a>
              </div>

              <div className="grid gap-6 sm:grid-cols-3 pt-6">
                {statTiles.map((tile) => (
                  <div key={tile.label} className="premium-card p-5 !rounded-3xl">
                    <p className="text-3xl font-black text-[var(--text-primary)]">{tile.value}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mt-1">{tile.label}</p>
                  </div>
                ))}
              </div>
            </div>
          }
          right={
            <div className="grid gap-6">
              {FEATURE_COLUMNS.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="premium-card p-6 !rounded-[2rem] group">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] group-hover:scale-110 transition-transform duration-500">
                      <Icon size={26} />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">{feature.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)] font-medium">{feature.description}</p>
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
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] shadow-sm">
                <Sparkles size={12} className="animate-pulse" />
                Live Demo
              </div>
              <h3 className="max-w-2xl text-4xl font-black leading-[1.1] tracking-tight md:text-6xl text-[var(--text-primary)]">
                Real-time template <span className="text-[var(--accent)]">preview.</span>
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg font-medium">
                Choose a template and see how your feedback page will look to your visitors instantly. Experience the premium interface your audience will see.
              </p>
            </div>
          }
          right={
            <div className="relative w-full">
              {/* Decorative glow */}
              <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-[100px] animate-pulse" />
              
              <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl transition-colors duration-500">
                {/* Browser-like Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                    <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                    <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="ml-4 flex-1 rounded-xl bg-[var(--bg-muted)] py-2 px-4 text-[10px] text-[var(--text-muted)] text-center border border-[var(--border-color)] font-mono tracking-tight">
                    verit.io/p/preview
                  </div>
                </div>
                
                <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
                  {/* Left Column: Preview */}
                  <div className="p-8 border-b lg:border-b-0 lg:border-r border-[var(--border-color)] flex flex-col bg-[var(--bg-primary)]/30 backdrop-blur-sm">
                    <div className="mb-10 flex items-center gap-5">
                      {/* Removed icon and fixed overlap */}
                      <div className="pt-1">
                        <h3 className="text-2xl font-black text-[var(--text-primary)] leading-none mb-2 tracking-tight">Live Preview</h3>
                        <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em]">Active Template</p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-6 rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 shadow-xl shadow-black/5">
                      <p className="text-3xl font-black text-[var(--text-primary)] leading-tight tracking-tight">{activeTemplate.headline}</p>
                      
                      <div className="relative group">
                        <textarea
                          readOnly
                          value={activeTemplate.note}
                          className="min-h-40 w-full rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-muted)]/50 p-6 text-sm text-[var(--text-secondary)] outline-none font-medium resize-none leading-relaxed"
                        />
                        <div className="absolute bottom-4 right-4 opacity-20">
                          <Wand2 size={16} className="text-[var(--accent)]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Selector */}
                  <div className="p-10 bg-[var(--bg-muted)]/30 flex flex-col justify-between backdrop-blur-sm">
                    <div>
                      <p className="text-[11px] font-black uppercase text-[var(--text-muted)] tracking-[0.3em] mb-8">Select a style</p>
                      <div className="grid grid-cols-2 gap-4 mb-12">
                        {TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={`relative group rounded-2xl p-4 text-xs font-black transition-all border-2 text-left h-24 flex flex-col justify-between overflow-hidden cursor-pointer ${
                              template.id === activeTemplate.id
                                ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-xl shadow-[var(--accent)]/20"
                                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--accent)]/50"
                            }`}
                          >
                            <span className="relative z-10">{template.title}</span>
                            {template.id === activeTemplate.id && (
                              <CheckCircle2 size={16} className="relative z-10 ml-auto" />
                            )}
                            
                            <div className={`absolute -right-2 -bottom-2 opacity-[0.05] transition-transform duration-500 group-hover:scale-110 ${
                              template.id === activeTemplate.id ? "opacity-[0.15]" : ""
                            }`}>
                              <LayoutTemplate size={64} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={continueWithTemplate}
                      className="group relative w-full overflow-hidden rounded-2xl bg-[var(--accent)] py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-[var(--accent)]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        Use this template
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        />




        <section id="how-it-works" className="w-full px-6 py-24 lg:px-12 2xl:px-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent)]/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--accent)]/5 blur-[120px] rounded-full" />
          </div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="relative z-10 text-center mb-20 max-w-3xl mx-auto space-y-6"
          >
            <p className="text-xs font-black uppercase tracking-[0.4em] text-[var(--accent)]">Execution</p>
            <h3 className="text-4xl font-black text-[var(--text-primary)] md:text-6xl tracking-tight">Simple and professional.</h3>
            <p className="text-lg text-[var(--text-secondary)] font-medium leading-relaxed">Get up and running in less than a minute. No complex setups, just clear, honest feedback from your audience.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="relative z-10 grid gap-8 md:grid-cols-3 max-w-7xl mx-auto"
          >
            {STEPS.map((step, index) => (
              <motion.div 
                key={step.title} 
                variants={fadeUp}
                className="premium-card p-10 !rounded-[3rem] group"
              >
                <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[var(--bg-primary)] text-[var(--accent)] border border-[var(--border-color)] shadow-sm group-hover:scale-110 group-hover:border-[var(--accent)] transition-all duration-500">
                  <step.icon size={32} />
                </div>
                
                <h4 className="text-2xl font-black text-[var(--text-primary)] mb-4 tracking-tight">{step.title}</h4>
                <p className="text-base leading-relaxed text-[var(--text-secondary)] font-medium">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Pricing Section ───────────────────────────────────────────── */}
        <section id="pricing" className="w-full px-6 pb-32 pt-16 lg:px-12 2xl:px-20">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="text-center mb-20 space-y-6"
          >
            <p className="text-xs font-black uppercase tracking-[0.4em] text-[var(--accent)]">Investment</p>
            <h3 className="text-4xl font-black text-[var(--text-primary)] md:text-6xl tracking-tight">Simple, honest pricing.</h3>
            <p className="text-lg text-[var(--text-secondary)] font-medium max-w-2xl mx-auto leading-relaxed">Choose the plan that fits your ambition. No hidden fees, just premium features to help you grow.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto items-end"
          >
            {[
              { id: "free", name: "Free", price: "₹0", color: "#6b7280", features: ["5 links", "All post types", "Basic dashboard"], cta: "Start for free" },
              { id: "pro", name: "Pro", price: "₹499", color: "var(--accent)", features: ["20 links", "Analytics", "Priority support"], popular: true, cta: "Unlock Pro" },
              { id: "ultra", name: "Ultra", price: "₹999", color: "#38bdf8", features: ["Unlimited links", "Custom branding", "Early access"], cta: "Go Ultra" },
            ].map((plan) => (
              <motion.div 
                key={plan.id}
                variants={fadeUp}
                className={`relative premium-card p-10 !rounded-[3rem] flex flex-col gap-8 group transition-all duration-500 ${
                  plan.popular ? "border-2 border-[var(--accent)] shadow-2xl shadow-[var(--accent)]/15 scale-105 z-10" : "opacity-90 hover:opacity-100"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-2 bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl shadow-[var(--accent)]/30">
                    Most Popular
                  </div>
                )}
                
                <div>
                  <h4 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{plan.name}</h4>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">{plan.price}</span>
                    <span className="text-sm font-bold text-[var(--text-muted)]">/month</span>
                  </div>
                </div>

                <div className="h-px bg-[var(--border-color)] w-full" />

                <ul className="space-y-5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-base font-medium text-[var(--text-secondary)]">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 shadow-inner">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                
                <Link to="/signup" className={`btn-primary w-full !py-4 shadow-xl group-hover:scale-[1.02] transition-transform ${
                  !plan.popular ? "btn-secondary !shadow-sm" : ""
                }`}>
                  {plan.cta}
                  <ArrowRight size={18} />
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
