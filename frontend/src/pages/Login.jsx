import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      if (res.data.user?.termsAccepted) {
        localStorage.setItem("termsAccepted", "true");
      } else {
        localStorage.removeItem("termsAccepted");
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md animate-fade-in-up">
        <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Welcome Back</h2>
        <p className="text-neutral-400 mb-8">Enter your details to access your TruthBox.</p>

        {error && <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Username</label>
            <input 
              type="text" 
              required
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="Your username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-400">
          Don't have an account? <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
