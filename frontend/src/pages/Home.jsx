import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Copy,
  Globe,
  LayoutTemplate,
  Lock,
  MessageSquare,
  MousePointerClick,
  Sparkles,
  Shield,
  Wand2,
} from "lucide-react";
import heroArt from "../assets/hero.png";

const FEATURES = [
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
    title: "Portfolio review",
    detail: "Ask what stands out, what feels confusing, and what should be improved first.",
    accent: "#7c3aed",
  },
  {
    title: "Content feedback",
    detail: "Test captions, posts, or newsletters before you publish them publicly.",
    accent: "#97ce23",
  },
  {
    title: "Product launch",
    detail: "Collect blunt reactions before launch day and sharpen your messaging.",
    accent: "#f97316",
  },
  {
    title: "Personal brand",
    detail: "See how people describe your profile, tone, and online presence.",
    accent: "#38bdf8",
  },
];

const DEMOS = [
  {
    key: "portfolio",
    label: "Portfolio",
    headline: "Make my portfolio clearer",
    prompt: "Which section is strongest, and where do you lose interest?",
    response: "The hero is strong, but the case studies need more proof.",
  },
  {
    key: "launch",
    label: "Launch",
    headline: "Is this product message sharp enough?",
    prompt: "Would you immediately understand the value if you saw this in your feed?",
    response: "The benefit is clear, but the CTA can be more direct.",
  },
  {
    key: "content",
    label: "Content",
    headline: "Does this caption sound confident?",
    prompt: "What line feels too weak or too long?",
    response: "Shorten the first sentence and lead with the main promise.",
  },
];

export default function Home() {
  const [activeDemo, setActiveDemo] = useState(DEMOS[0]);
  const [demoNote, setDemoNote] = useState("I want blunt but useful feedback on this idea.");

  const statTiles = useMemo(
    () => [
      { value: "30 sec", label: "to publish a link" },
      { value: "100%", label: "anonymous responses" },
      { value: "5 min", label: "to launch a branded page" },
    ],
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(151,206,35,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.58))]" />

      <header className="relative z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-lg">
              <Sparkles className="text-accent" size={19} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold leading-none">
                Truth<span className="text-accent">Box</span>
              </h1>
              <p className="text-xs text-gray-500">Anonymous feedback, upgraded</p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <a href="#how-it-works" className="text-sm text-gray-300 transition-colors hover:text-white">
              How it works
            </a>
            <a href="#templates" className="text-sm text-gray-300 transition-colors hover:text-white">
              Templates
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

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-12 px-6 pb-10 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-4">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-300">
              <MousePointerClick size={14} className="text-accent" />
              Built for honest, anonymous feedback
            </div>

            <div className="space-y-5">
              <h2 className="max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">
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
                href="#demo"
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

          <div id="demo" className="relative">
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
                      <h3 className="text-lg font-bold">How a feedback page feels</h3>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-3xl border border-white/10 bg-black/45 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{activeDemo.headline}</p>
                        <p className="text-xs text-gray-500">Anonymous response preview</p>
                      </div>
                      <div className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                        {activeDemo.label}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/60 p-4 text-sm text-gray-300">
                      {activeDemo.prompt}
                    </div>

                    <textarea
                      value={demoNote}
                      onChange={(e) => setDemoNote(e.target.value)}
                      className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-accent/50"
                      placeholder="Write your response here..."
                    />

                    <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-accent">Example reply</p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-200">{activeDemo.response}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 p-6 md:border-l md:border-t-0">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {DEMOS.map((demo) => {
                      const active = demo.key === activeDemo.key;
                      return (
                        <button
                          key={demo.key}
                          onClick={() => setActiveDemo(demo)}
                          className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                            active
                              ? "bg-accent text-main"
                              : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          {demo.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Branding</p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-accent/15 ring-2 ring-accent/40" />
                        <div>
                          <p className="font-semibold">Custom title, color, and prompt</p>
                          <p className="text-sm text-gray-500">Make every link feel like your own product.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Current note</p>
                        <p className="mt-2 text-sm text-gray-200">{demoNote}</p>
                      </div>
                      <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-bold text-main">
                        Copy demo link
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">How it works</p>
            <h3 className="text-3xl font-extrabold md:text-4xl">Three steps from idea to insight</h3>
            <p className="max-w-2xl text-gray-400">
              The experience should feel polished for the creator and effortless for the person leaving feedback.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
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
        </section>

        <section id="templates" className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-10 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Templates</p>
            <h3 className="text-3xl font-extrabold md:text-4xl">Start with a strong prompt instead of a blank screen</h3>
            <p className="max-w-2xl text-gray-400">
              People use the app faster when they can choose a ready-made use case instead of inventing wording from scratch.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {TEMPLATES.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.accent }} />
                  <LayoutTemplate size={18} style={{ color: item.accent }} />
                </div>
                <h4 className="text-xl font-bold">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-gray-400">{item.detail}</p>
                <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: item.accent }}>
                  Use template
                  <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(151,206,35,0.16),rgba(255,255,255,0.04))] p-8 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-5">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Built to grow</p>
                <h3 className="text-3xl font-extrabold md:text-5xl">Make the product look like something people want to keep using.</h3>
                <p className="max-w-2xl text-gray-300 leading-8">
                  The homepage should persuade, the dashboard should guide, and each feedback page should feel branded enough to share without embarrassment.
                </p>
              </div>

              <div className="grid gap-4">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="flex items-start gap-4 rounded-3xl border border-white/10 bg-black/35 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold">{feature.title}</h4>
                        <p className="mt-1 text-sm leading-6 text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 pt-4">
          <div className="rounded-[2rem] border border-white/10 bg-black/45 p-8 md:p-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Ready</p>
            <h3 className="mt-4 text-3xl font-extrabold md:text-5xl">Launch a more serious-looking product today.</h3>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400 leading-7">
              We’ve got the first five upgrades mapped out: the new homepage, interactive demo, templates, analytics, and link branding.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-bold text-main transition-all hover:-translate-y-0.5"
              >
                Start building
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
