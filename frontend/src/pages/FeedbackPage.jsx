import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, ShieldCheck, CheckCircle } from "lucide-react";
import api from "../api";

export default function FeedbackPage() {
  const { linkId } = useParams();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("submitting");
    try {
      await api.post(`/feedback/send-feedback/${linkId}`, { message });
      setStatus("success");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Failed to send feedback. The link might be invalid.");
    }
  };

  return (
    <div className="min-h-screen bg-main flex flex-col items-center justify-center p-6 text-center text-white font-sans">
      <div className="w-full max-w-lg">
        
        {/* Branding Header */}
        <Link to="/" className="inline-block mb-12 hover:scale-105 transition-transform">
          <h1 className="text-4xl font-extrabold tracking-tight font-heading">
            Truth<span className="text-accent">Box</span>
          </h1>
        </Link>

        {status === "success" ? (
          <div className="glass p-10 rounded-3xl space-y-6 animate-fade-in-up">
            <div className="mx-auto w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-3xl font-bold font-heading">Feedback Sent!</h2>
            <p className="text-gray-400 text-lg">Your anonymous message has been delivered securely.</p>
            <div className="pt-6">
              <Link to="/signup" className="inline-block px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-medium">
                Get your own TruthBox
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass p-8 md:p-12 rounded-3xl text-left animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6 px-4 py-2 bg-accent/10 text-accent rounded-full w-fit">
              <ShieldCheck size={18} />
              <span className="text-sm font-semibold">100% Anonymous</span>
            </div>
            
            <h2 className="text-3xl font-bold font-heading mb-3">Send Feedback</h2>
            <p className="text-gray-400 mb-8">
              Be honest. The recipient will never know who sent this message.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your honest thoughts here..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-lg min-h-[200px] focus:outline-none focus:border-accent transition-colors resize-y text-white placeholder:text-gray-600"
                required
              />
              
              {status === "error" && (
                <div className="text-red-400 text-sm bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "submitting" || !message.trim()}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent text-main font-bold text-lg hover:bg-[#a5e027] disabled:opacity-50 disabled:hover:bg-accent transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {status === "submitting" ? "Sending..." : "Send Anonymously"}
                {!status && <Send size={20} />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
