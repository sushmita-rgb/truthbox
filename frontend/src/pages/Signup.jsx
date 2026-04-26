import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import VeritLogo from "../components/VeritLogo";
import Footer from "../components/Footer";
import { Zap, Crown, Mail, ArrowLeft } from "lucide-react";

export default function Signup() {
  // ... (keep existing state and logic)
  const [formData, setFormData] = useState({ username: "", email: "", password: "", otp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planIntent = searchParams.get("plan");

  const selectedTemplateRaw = localStorage.getItem("Verit.selectedTemplate");
  let selectedTemplate = null;
  if (selectedTemplateRaw) {
    try { selectedTemplate = JSON.parse(selectedTemplateRaw); } catch (err) {}
  }

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;
    
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/send-otp", { email: formData.email });
      setOtpSent(true);
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/signup", formData);
      const loginPath = planIntent ? `/login?plan=${planIntent}` : "/login";
      navigate(loginPath);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main/45 flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md animate-fade-in-up z-10 relative overflow-hidden">
          
          {otpSent && (
            <button 
              onClick={() => setOtpSent(false)} 
              className="absolute top-8 left-8 text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <Link to="/" className="flex justify-center mb-8 mt-2">
            <VeritLogo className="h-16 w-auto" showTagline={false} />
          </Link>

          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in-up">
              {error}
            </div>
          )}

          {!otpSent ? (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-extrabold text-white mb-2">Create Account</h2>
                <p className="text-gray-400 text-sm">Join Verit and start receiving anonymous feedback securely.</p>
              </div>
              
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    placeholder="unique_username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full py-4 mt-2 rounded-2xl bg-accent text-main font-bold hover:shadow-[0_0_30px_rgba(151,206,35,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                >
                  {loading ? "Sending code..." : "Continue"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-accent" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-2">Check your email</h2>
                <p className="text-gray-400 text-sm">
                  We sent a 6-digit verification code to <br/>
                  <span className="font-bold text-white">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyAndSignup} className="space-y-6 animate-fade-in-up">
                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-4 text-center text-3xl font-mono text-white tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-gray-700"
                    placeholder="000000"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  />
                </div>

                <button
                  disabled={loading || formData.otp.length !== 6}
                  className="w-full py-4 rounded-2xl bg-accent text-main font-bold hover:shadow-[0_0_30px_rgba(151,206,35,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={cooldown > 0 || loading}
                    className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-gray-400"
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't receive code? Resend"}
                  </button>
                </div>
              </form>
            </>
          )}

          {!otpSent && (
            <p className="mt-8 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-medium hover:text-[#a5e027]">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
