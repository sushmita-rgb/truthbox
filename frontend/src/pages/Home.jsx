import { Link } from "react-router-dom";
import { MessageSquare, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center selection:bg-indigo-500/30">
      
      {/* Hero Section */}
      <div className="max-w-3xl space-y-8 animate-fade-in-up">
        <div className="inline-block px-4 py-1.5 rounded-full glass text-sm text-indigo-300 font-medium mb-4">
          TruthBox v2.0
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Unfiltered <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Feedback</span>,<br/>
          Zero Judgment.
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
          Share your issues, post an image or a link, and collect brutally honest, 100% anonymous thoughts from anyone.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 transition-all">
            Get Started Free
          </Link>
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl glass font-bold text-lg hover:bg-white/10 transition-all">
            Login
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-32 max-w-5xl">
        {[
          { icon: <Shield className="w-8 h-8 text-indigo-400" />, title: "100% Anonymous", desc: "No tracking, no identity exposure. Pure honesty." },
          { icon: <Zap className="w-8 h-8 text-purple-400" />, title: "Instant Links", desc: "Generate a custom link for specific issues instantly." },
          { icon: <MessageSquare className="w-8 h-8 text-pink-400" />, title: "Rich Uploads", desc: "Attach images, videos, or URLs to your questions." }
        ].map((feat, i) => (
          <div key={i} className="glass p-8 rounded-3xl text-left hover:-translate-y-2 transition-transform duration-300">
            <div className="p-4 rounded-2xl bg-white/5 inline-block mb-4">
               {feat.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
            <p className="text-neutral-400">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
