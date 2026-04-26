import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import TruthBoxLogo from "../components/TruthBoxLogo";

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/admin-login", formData);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.1)_0%,transparent_50%)]" />
      <div className="relative z-10 glass p-8 md:p-12 rounded-3xl w-full max-w-md animate-fade-in-up border-red-500/20 shadow-[0_0_50px_rgba(255,0,0,0.1)]">
        <div className="flex justify-center mb-8">
          <TruthBoxLogo className="h-16 w-auto" showTagline={false} />
        </div>

        <p className="text-center text-xs uppercase tracking-[0.3em] text-red-500 font-bold mb-8">God Mode Authorization</p>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Admin Email</label>
            <input
              type="email"
              required
              className="w-full bg-black/80 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Access Key</label>
            <input
              type="password"
              required
              className="w-full bg-black/80 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-4 mt-4 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 font-bold uppercase tracking-widest hover:bg-red-600/30 hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Enter God Mode"}
          </button>
        </form>
      </div>
    </div>
  );
}
