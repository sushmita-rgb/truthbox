import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import CloudCanvas from "../components/CloudCanvas";

const POSITIVE_TEXTS = [
  { 
    title: "A Space for Truth", 
    desc: "Verit is built on the belief that honest feedback is the greatest gift. You've just created a bridge for meaningful connection.",
    icon: ShieldCheck
  },
  { 
    title: "100% Secure & Private", 
    desc: "Your identity and your users' privacy are our top priority. Everything you receive is encrypted and safely delivered.",
    icon: CheckCircle2
  },
  { 
    title: "Launch with Confidence", 
    desc: "Our AI moderation ensures that your space remains constructive. You're in total control of your digital feedback loop.",
    icon: Zap
  }
];

export default function WelcomeJourney() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Staggered presentation of the 3 points
    const timers = [
      setTimeout(() => setStep(1), 2000),
      setTimeout(() => setStep(2), 4000),
      setTimeout(() => setStep(3), 6000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const handleStart = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <CloudCanvas />
      
      {/* Background vignette */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />

      <div className="max-w-2xl w-full relative z-10 text-center">
        <AnimatePresence mode="wait">
          {step < 3 ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto shadow-glow">
                <Sparkles size={48} className="text-brand animate-pulse" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tighter">
                  Welcome to <span className="text-brand">Verit.</span>
                </h1>
                <p className="text-[var(--text-secondary)] text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
                  The journey to authentic feedback starts here. We're setting up your workspace...
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {[0, 1, 2].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-1000 ${i < step ? 'w-12 bg-brand' : i === step ? 'w-12 bg-brand/30' : 'w-4 bg-white/5'}`} 
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              <div className="grid gap-6">
                {POSITIVE_TEXTS.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-start gap-5 text-left backdrop-blur-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0 border border-brand/20">
                      <item.icon size={24} className="text-brand" />
                    </div>
                    <div>
                      <h4 className="text-[var(--text-primary)] font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={handleStart}
                className="group relative px-12 py-5 bg-brand rounded-2xl font-black text-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(151,206,35,0.4)]"
              >
                Let's start the journey
                <ArrowRight size={22} className="inline-block ml-3 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative footer text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 text-[10px] text-gray-500 uppercase tracking-[0.5em] font-black"
      >
        Verified • Secure • Anonymous
      </motion.div>
    </div>
  );
}
