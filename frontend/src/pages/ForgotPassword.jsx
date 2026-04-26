import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import TruthBoxLogo from "../components/TruthBoxLogo";
import { KeyRound, ArrowLeft, Mail, Lock } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [formData, setFormData] = useState({ email: "", otp: "", newPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;
    
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email: formData.email });
      setStep(2);
      setCooldown(60);
      setSuccess("If that email is registered, a reset code was sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/auth/reset-password", formData);
      setSuccess(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main/45 flex items-center justify-center p-4 font-sans relative">
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md animate-fade-in-up z-10 relative overflow-hidden">
        
        {step === 2 && (
          <button 
            onClick={() => setStep(1)} 
            className="absolute top-8 left-8 text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <Link to="/" className="flex justify-center mb-8 mt-2">
          <TruthBoxLogo className="h-16 w-auto" showTagline={false} />
        </Link>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in-up">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-4 mb-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm animate-fade-in-up">
            {success}
          </div>
        )}

        {step === 1 ? (
          <>
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound size={28} className="text-accent" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Reset Password</h2>
              <p className="text-gray-400 text-sm">Enter your email and we'll send you a link to get back into your account.</p>
            </div>
            
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <button
                disabled={loading || !formData.email}
                className="w-full py-4 mt-2 rounded-2xl bg-accent text-main font-bold hover:shadow-[0_0_30px_rgba(151,206,35,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8 text-center animate-fade-in-up">
              <h2 className="text-2xl font-extrabold text-white mb-2">Create New Password</h2>
              <p className="text-gray-400 text-sm">
                Enter the 6-digit code sent to <br/>
                <span className="font-bold text-white">{formData.email}</span>
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6 animate-fade-in-up">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>
              </div>

              <button
                disabled={loading || formData.otp.length !== 6 || !formData.newPassword}
                className="w-full py-4 rounded-2xl bg-accent text-main font-bold hover:shadow-[0_0_30px_rgba(151,206,35,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={cooldown > 0 || loading}
                  className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-gray-400"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't receive code? Resend"}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 1 && (
          <p className="mt-8 text-center text-sm text-gray-400">
            Remember your password?{" "}
            <Link to="/login" className="text-accent font-medium hover:text-[#a5e027]">
              Back to Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
