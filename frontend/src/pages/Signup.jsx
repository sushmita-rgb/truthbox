import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import VeritLogo from "../components/VeritLogo";
import Footer from "../components/Footer";
import { Zap, Crown, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", otp: "" });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    // Clear any existing session to ensure a fresh signup/login
    localStorage.removeItem("Verit.token");
    localStorage.removeItem("Verit.user");
    
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const togglePassword = () => {
    setShowPassword(true);
    setTimeout(() => {
      setShowPassword(false);
    }, 10000);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!termsAccepted) {
      setError("Please agree to the Terms and Conditions first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/google-login", { 
        token: credentialResponse.credential,
        isSignup: true 
      });
      
      // Store token and user
      localStorage.setItem("Verit.token", res.data.token);
      localStorage.setItem("Verit.user", JSON.stringify(res.data.user));

      if (planIntent) {
        localStorage.setItem("Verit.planIntent", planIntent);
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/send-otp", { email: formData.email });
      setOtpSent(true);
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError("Please agree to the Terms and Conditions");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/signup", formData);
      
      // Auto-login: Store token and user
      localStorage.setItem("Verit.token", res.data.token);
      localStorage.setItem("Verit.user", JSON.stringify(res.data.user));
      
      window.location.href = "/welcome";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log("Creating account and redirecting to welcome...");
      const res = await api.post("/auth/signup", formData);
      
      // Auto-login: Store token and user
      localStorage.setItem("Verit.token", res.data.token);
      localStorage.setItem("Verit.user", JSON.stringify(res.data.user));
      
      // Force a hard redirect to the Welcome Journey to ensure it's reached
      window.location.href = "/welcome";
    } catch (err) {
      console.error("Signup failed:", err);
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans text-[var(--text-primary)] transition-colors duration-300">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-[var(--glass-bg)] backdrop-blur-2xl p-8 md:p-12 rounded-[40px] border border-[var(--border-color)] shadow-2xl w-full max-w-md animate-fade-in-up z-10 relative overflow-hidden">
          
          {otpSent && (
            <button 
              onClick={() => setOtpSent(false)} 
              className="absolute top-8 left-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <Link to="/" className="flex justify-center mb-8 mt-2">
            <VeritLogo className="h-16 w-auto" showTagline={false} />
          </Link>

          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in-up">
              {error}
            </div>
          )}

          {!otpSent ? (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Create Account</h2>
                <p className="text-[var(--text-secondary)] text-sm">Join TruthBox and start receiving anonymous feedback securely.</p>
              </div>
              
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Username</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-sm"
                    placeholder="unique_username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-sm"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Password</label>
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

                <div className="flex items-start gap-3 px-2 py-1">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label htmlFor="terms" className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    I agree to the <Link to="/terms" style={{ color: 'var(--accent)' }} className="font-bold hover:underline">Terms</Link> and <Link to="/privacy" style={{ color: 'var(--accent)' }} className="font-bold hover:underline">Privacy</Link>.
                  </label>
                </div>

                <button
                  disabled={loading}
                  className="w-full py-4 mt-2 rounded-2xl bg-[var(--accent)] text-white font-bold shadow-lg shadow-[var(--accent)]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <div className="mt-8 space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-[var(--border-color)]"></div>
                  <span className="relative bg-[#1a1a1a] px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] z-10 rounded-full border border-[var(--border-color)]">Or join with</span>
                </div>
                
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google login failed")}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    text="signup_with"
                    width="320"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-[var(--accent)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-[var(--accent)]" />
                </div>
                <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Check your email</h2>
                <p className="text-[var(--text-secondary)] text-sm">
                  We sent a 6-digit verification code to <br/>
                  <span className="font-bold text-[var(--text-primary)]">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyAndSignup} className="space-y-6 animate-fade-in-up">
                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl px-5 py-4 text-center text-3xl font-mono text-[var(--text-primary)] tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all placeholder:text-[var(--text-secondary)]/30"
                    placeholder="000000"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  />
                </div>

                <button
                  disabled={loading || formData.otp.length !== 6}
                  className="w-full py-4 rounded-2xl bg-[var(--accent)] text-white font-bold shadow-lg shadow-[var(--accent)]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? "Creating account..." : "Verify & Create Account"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={cooldown > 0 || loading}
                    className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
              </form>
            </>
          )}

          {!otpSent && (
            <p className="mt-8 text-center text-xs text-[var(--text-secondary)]">
              Already have an account?{" "}
              <Link to="/login" style={{ color: 'var(--accent)' }} className="font-bold uppercase tracking-widest ml-1 hover:underline">
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
