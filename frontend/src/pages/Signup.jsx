import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import TruthBoxLogo from "../components/TruthBoxLogo";

export default function Signup() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const selectedTemplateRaw = localStorage.getItem("truthbox.selectedTemplate");
  let selectedTemplate = null;
  if (selectedTemplateRaw) {
    try {
      selectedTemplate = JSON.parse(selectedTemplateRaw);
    } catch (err) {
      selectedTemplate = null;
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/signup", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main/45 flex items-center justify-center p-4 font-sans">
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md animate-fade-in-up">
        
        <Link to="/" className="flex justify-center mb-4">
          <TruthBoxLogo className="h-20 w-auto" showTagline={false} />
        </Link>
        
        <p className="text-gray-400 mb-8">Start receiving anonymous feedback today.</p>

        {selectedTemplate && (
          <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Template selected</p>
            <p className="mt-2 text-sm font-semibold text-white">{selectedTemplate.title}</p>
            <p className="mt-1 text-sm text-gray-400">{selectedTemplate.summary}</p>
          </div>
        )}

        {error && <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input 
              type="text" 
              required
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              placeholder="unique_username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full py-4 mt-2 rounded-2xl bg-accent text-main font-bold hover:shadow-[0_0_30px_rgba(151,206,35,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-accent font-medium hover:text-[#a5e027]">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
