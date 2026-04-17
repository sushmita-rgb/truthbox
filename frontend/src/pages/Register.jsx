import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md animate-fade-in-up">
        <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Join TruthBox</h2>
        <p className="text-neutral-400 mb-8">Start receiving anonymous feedback today.</p>

        {error && <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Username</label>
            <input 
              type="text" 
              required
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="unique_username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-400">
          Already have an account? <Link to="/login" className="text-purple-400 font-medium hover:text-purple-300">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
