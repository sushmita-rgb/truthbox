import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import VeritLogo from "../components/VeritLogo";
import Footer from "../components/Footer";
import { Zap, Crown, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planIntent = searchParams.get("plan"); // "pro" | "ultra" | null
17: 
  useEffect(() => {
    // Clear any existing session to ensure a fresh login
    localStorage.removeItem("Verit.token");
    localStorage.removeItem("Verit.user");
  }, []);

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/google-login", { token: credentialResponse.credential });
      
      // Store token and user
      localStorage.setItem("Verit.token", res.data.token);
      localStorage.setItem("Verit.user", JSON.stringify(res.data.user));

      if (planIntent) {
        localStorage.setItem("Verit.planIntent", planIntent);
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans text-[var(--text-primary)] transition-colors duration-300">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-[var(--glass-bg)] backdrop-blur-2xl p-8 md:p-12 rounded-[40px] border border-[var(--border-color)] shadow-2xl w-full max-w-md animate-fade-in-up">
          <Link to="/" className="flex justify-center mb-6">
            <VeritLogo className="h-16 w-auto" showTagline={false} />
          </Link>

          {/* Plan intent badge */}
          {planIntent && (
            <div className="mb-8 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 flex items-center gap-3">
              {planIntent === "ultra" ? (
                <Crown size={18} className="text-[var(--text-primary)] shrink-0" />
              ) : (
                <Zap size={18} className="text-[var(--accent)] shrink-0" />
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-bold">Almost there</p>
                <p className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">
                  {planIntent === "ultra" ? "Pro Ultra — ₹999/mo" : "Pro — ₹499/mo"}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Sign in to complete your subscription.
                </p>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-[var(--text-secondary)] mb-8 text-sm">
            {planIntent
              ? "Sign in to complete your purchase."
              : "Enter your details to access your dashboard."}
          </p>

          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Username</label>
              <input
                type="text"
                required
                className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-sm"
                placeholder="Your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Password</label>
                <Link to="/forgot-password" style={{ color: 'var(--accent)' }} className="text-[10px] font-bold uppercase tracking-widest hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all pr-12 text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 mt-2 rounded-2xl bg-[var(--accent)] text-white font-bold shadow-lg shadow-[var(--accent)]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 text-sm"
            >
              {loading ? "Signing in..." : planIntent ? "Sign in & Continue" : "Sign In"}
            </button>
          </form>

          <div className="mt-8 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-[var(--border-color)]"></div>
              <span className="relative bg-[#1a1a1a] px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] z-10 rounded-full border border-[var(--border-color)]">Or continue with</span>
            </div>
            
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed")}
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
                width="320"
              />
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-[var(--text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link
              to={planIntent ? `/signup?plan=${planIntent}` : "/signup"}
              style={{ color: 'var(--accent)' }}
              className="font-bold uppercase tracking-widest ml-1 hover:underline"
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
