import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, Shield, AlertTriangle } from "lucide-react";
import api from "../api";
import TermsModal from "../components/TermsModal";

export default function PublicIssue() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("loading"); // loading, ready, success, error
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("anonymousTermsAccepted") !== "true") {
      setShowTerms(true);
    }
  }, []);

  useEffect(() => {
    api.get(`/issues/public/${id}`)
      .then(res => {
        setIssue(res.data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setStatus("loading");
    try {
      await api.post(`/messages/${id}`, { content });
      setStatus("success");
    } catch {
      alert("Failed to send message.");
      setStatus("ready");
    }
  };

  const getMediaUrl = (url) => {
    if (url.startsWith("/uploads")) {
      const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
      return `${backendUrl}${url}`;
    }
    return url;
  };

  if (status === "loading" && !issue) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (status === "error") return <div className="min-h-screen flex items-center justify-center"><div className="glass p-8 text-center text-red-400">Issue not found. It might have been deleted.</div></div>;

  const handleAcceptTerms = async () => {
    localStorage.setItem("anonymousTermsAccepted", "true");
    setShowTerms(false);
  };

  return (
    <>
    {showTerms && <TermsModal onAccept={handleAcceptTerms} />}
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-10 selection:bg-pink-500/30">
      
      <div className="w-full max-w-2xl mb-8 flex items-center gap-2 text-pink-400 justify-center">
        <Shield size={18} />
        <span className="text-sm font-semibold tracking-wide uppercase">100% Anonymous Delivery</span>
      </div>

      <div className="glass p-8 md:p-12 rounded-[2.5rem] w-full max-w-2xl animate-fade-in-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <p className="text-neutral-400 mb-2">Asking for feedback:</p>
          <h1 className="text-3xl font-bold mb-4">{issue.title}</h1>
          {issue.description && <p className="text-neutral-300 text-lg mb-6 leading-relaxed">{issue.description}</p>}

          {/* Media Rendering */}
          {issue.fileUrl && issue.fileType !== 'none' && (
            <div className="mb-8 rounded-2xl overflow-hidden bg-black/40 border border-white/5">
              {issue.fileType === 'image' && <img src={getMediaUrl(issue.fileUrl)} alt="Attachment" className="w-full h-auto object-contain max-h-[400px]" />}
              {issue.fileType === 'video' && <video src={getMediaUrl(issue.fileUrl)} controls className="w-full h-auto max-h-[400px]" />}
              {issue.fileType === 'link' && (
                <a href={issue.fileUrl} target="_blank" rel="noreferrer" className="block p-6 text-center text-pink-400 hover:text-pink-300 hover:bg-white/5 transition-colors font-medium">
                  🔗 Open Attached Link
                </a>
              )}
            </div>
          )}

          {status === "success" ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
                <Send className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
              <p className="text-neutral-400">{issue.author} will never know it was you.</p>
              
              <div className="mt-10 pt-10 border-t border-white/10">
                <p className="text-sm text-neutral-500 mb-4">Want to receive anonymous messages too?</p>
                <Link to="/register" className="inline-block px-6 py-3 rounded-xl glass text-white font-medium hover:bg-white/10 transition-colors">
                  Get your own TruthBox
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 relative">
              <textarea
                required
                maxLength={500}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-6 text-white text-lg focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 min-h-[160px] pb-16 resize-none"
                placeholder="Be honest, be brutal, be kind..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-4">
                <span className="text-xs text-neutral-500 font-mono">{content.length}/500</span>
                <button 
                  disabled={status === 'loading'}
                  className="p-3 rounded-xl bg-pink-600 text-white hover:bg-pink-500 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(219,39,119,0.4)] disabled:opacity-50"
                  type="submit"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
