import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import VeritLogo from "../components/VeritLogo";
import Footer from "../components/Footer";
import { Zap, Crown, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planIntent = searchParams.get("plan"); // "pro" | "ultra" | null

  const togglePassword = () => {
    setShowPassword(true);
    setTimeout(() => {
      setShowPassword(false);
    }, 10000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", formData);
      // Store plan intent so Dashboard can auto-open PricingModal
      if (planIntent) {
        localStorage.setItem("Verit.planIntent", planIntent);
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main/45 flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md animate-fade-in-up">
          <Link to="/" className="flex justify-center mb-4">
            <VeritLogo className="h-20 w-auto" showTagline={false} />
          </Link>

          {/* Plan intent badge */}
          {planIntent && (
            <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/10 p-4 flex items-center gap-3">
              {planIntent === "ultra" ? (
                <Crown size={18} className="text-white shrink-0" />
              ) : (
                <Zap size={18} className="text-accent shrink-0" />
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Almost there</p>
                <p className="mt-0.5 text-sm font-bold text-white">
                  {planIntent === "ultra" ? "Pro Ultra — ₹999/mo" : "Pro — ₹499/mo"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sign in to complete your subscription.
                </p>
              </div>
            </div>
          )}

          <p className="text-gray-400 mb-8">
            {planIntent
              ? "Sign in to complete your purchase."
              : "Enter your details to access your dashboard."}
          </p>

          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                required
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                placeholder="Your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 mt-2 rounded-2xl bg-accent text-main font-bold hover:shadow-[0_0_30px_rgba(151,206,35,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : planIntent ? "Sign in & continue to checkout" : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              to={planIntent ? `/signup?plan=${planIntent}` : "/signup"}
              className="text-accent font-medium hover:text-[#a5e027]"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
