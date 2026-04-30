import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ShieldCheck, CheckCircle, FileUp, Film, Globe, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import api, { BACKEND_URL } from "../api";
import TermsModal from "../components/TermsModal";

// BACKEND is now imported from api.js

const getFullUrl = (url) => {
  if (!url) return "";
  
  if (url.startsWith("http")) {
    // If it's a PDF, go DIRECT to Cloudinary with force-download to bypass proxy issues
    if (url.toLowerCase().endsWith('.pdf')) {
      let directUrl = url;
      if (!directUrl.includes('fl_attachment')) {
        directUrl = directUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      return directUrl + (directUrl.includes('?') ? '&' : '?') + `v=${Date.now()}`;
    }
    
    // For images/videos, we can still use the proxy to bypass ISP blocks
    if (url.includes("res.cloudinary.com")) {
      return url.replace("https://res.cloudinary.com", "/files") + (url.includes('?') ? '&' : '?') + `v=${Date.now()}`;
    }
    return url;
  }
  
  return `${BACKEND_URL}${url}`;
};

function PostPreview({ postType, content, fileUrl, fileName, accentColor }) {
  if (!postType || postType === "text") {
    return content ? (
      <div className="mb-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 text-sm leading-relaxed text-[var(--text-primary)]" style={{ borderColor: `${accentColor}40` }}>
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
          <FileText size={13} />
          Post Content
        </div>
        <p className="font-medium">{content}</p>
      </div>
    ) : null;
  }

  if (postType === "url") {
    return (
      <div className="mb-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5" style={{ borderColor: `${accentColor}40` }}>
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
          <Globe size={13} />
          Shared Link
        </div>
        <a href={content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 break-all text-sm font-semibold transition-all hover:opacity-70 underline underline-offset-4" style={{ color: accentColor }}>
          <ExternalLink size={14} className="shrink-0" />
          {content}
        </a>
      </div>
    );
  }

  if (postType === "image") {
    return (
      <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-lg">
        <div className="flex items-center gap-2 bg-[var(--bg-primary)] p-3 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] border-b border-[var(--border-color)]">
          <ImageIcon size={12} />
          Shared Image
        </div>
        <div className="relative group p-1 bg-[var(--bg-primary)]/50">
          <img 
            src={getFullUrl(fileUrl)} 
            alt={fileName || "image"} 
            className="w-full h-auto max-h-[50vh] md:max-h-[70vh] object-contain block mx-auto transition-transform duration-500 group-hover:scale-[1.01]" 
          />
        </div>
        {content && (
          <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 md:p-6">
            <p className="text-sm md:text-base leading-relaxed text-[var(--text-secondary)] italic">"{content}"</p>
          </div>
        )}
      </div>
    );
  }  if (postType === "pdf") {
    return (
      <div className="mb-8 overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl">
        <div className="flex items-center gap-2 bg-[var(--bg-primary)] p-4 text-xs font-bold uppercase tracking-widest text-orange-500 border-b border-[var(--border-color)]">
          <FileText size={14} />
          Shared PDF Document
        </div>
        
        <div className="p-12 flex flex-col items-center justify-center bg-[var(--bg-secondary)]">
          <div className="w-24 h-24 bg-orange-500/5 rounded-3xl flex items-center justify-center mb-6 border border-orange-500/20 shadow-sm">
            <FileText size={48} className="text-orange-500" />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)] mb-8 truncate max-w-xs">{fileName || "document.pdf"}</p>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <a 
              href={getFullUrl(fileUrl)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-orange-500 text-white text-center font-bold text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <ExternalLink size={18} /> View Document
            </a>
          </div>
        </div>

        {content && (
          <div className="p-6 bg-[var(--bg-primary)]/50 border-t border-[var(--border-color)]">
            <p className="text-base leading-relaxed text-[var(--text-secondary)] italic">"{content}"</p>
          </div>
        )}
      </div>
    );
  }

  if (postType === "video") {
    return (
      <div className="mb-8 overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl">
        <div className="flex items-center gap-2 bg-[var(--bg-primary)] p-4 text-xs font-bold uppercase tracking-widest text-purple-500 border-b border-[var(--border-color)]">
          <Film size={14} />
          Shared Video
        </div>
        <video 
          src={getFullUrl(fileUrl)} 
          controls 
          className="w-full h-auto max-h-[70vh] block mx-auto bg-black" 
        />
        {content && (
          <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
            <p className="text-base leading-relaxed text-[var(--text-secondary)] italic">"{content}"</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function FeedbackPage() {
  const { linkId } = useParams();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [postData, setPostData] = useState(null);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    let retries = 0;
    const maxRetries = 3;

    const fetchPost = async () => {
      try {
        // Try the standard API first
        const r = await api.get(`/links/${linkId}`);
        setPostData(r.data);
      } catch (err) {
        // Fallback to a cleaner native fetch without extra headers
        try {
          const targetUrl = `/api/links/${linkId}`;
          const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            mode: 'cors'
          });
          
          if (response.ok) {
            const data = await response.json();
            setPostData(data);
          } else {
            throw new Error(`Server returned ${response.status}`);
          }
        } catch (fallbackErr) {
          if (retries < maxRetries) {
            retries++;
            setTimeout(fetchPost, 1000 * retries);
          } else {
            setErrorMsg(`Mobile Security Block (${fallbackErr.message}). Try opening in a different browser or turning off Private Mode.`);
            setStatus("error");
          }
        }
      }
    };

    fetchPost();
    // Increment view count
    api.post(`/links/${linkId}/view`).catch(() => {});
  }, [linkId]);

  useEffect(() => {
    if (localStorage.getItem("anonymousTermsAccepted") !== "true") {
      setShowTerms(true);
    }
  }, []);

  const accentColor = useMemo(() => postData?.accentColor || "#97ce23", [postData?.accentColor]);

  const handleAcceptTerms = async () => {
    localStorage.setItem("anonymousTermsAccepted", "true");
    setShowTerms(false);
  };

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
      setErrorMsg(err.response?.data?.message || "Failed to send. The link might be invalid.");
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 text-[var(--text-primary)] font-sans transition-colors duration-500 bg-[var(--bg-primary)]"
    >
      {/* Background Decorative Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40" 
        style={{
          background: `radial-gradient(circle at top, ${accentColor}, transparent 50%), radial-gradient(circle at bottom right, ${accentColor}44, transparent 40%)`,
        }}
      />
      {showTerms && <TermsModal onAccept={handleAcceptTerms} />}
      <div className="relative z-10 w-full max-w-lg">
        <Link to="/" className="mb-10 inline-block transition-transform hover:scale-105">
          <h1 className="text-center text-4xl font-black tracking-tight font-heading">
            Verit
          </h1>
        </Link>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="premium-card p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-6"
                style={{ background: `${accentColor}15` }}
              >
                <CheckCircle className="h-10 w-10" style={{ color: accentColor }} />
              </motion.div>
              <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Feedback Sent!</h2>
              <p className="text-[var(--text-secondary)] mt-3">Your anonymous message was delivered securely.</p>
              <Link to="/signup" className="btn-primary mt-8 inline-flex items-center gap-2">
                Get TruthBox for yourself <ExternalLink size={16} />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="premium-card p-8 md:p-10"
            >
              <div className="mb-8 flex w-fit items-center gap-3 rounded-full px-4 py-2 border" style={{ background: `${accentColor}05`, color: accentColor, borderColor: `${accentColor}30` }}>
                <ShieldCheck size={16} />
                <span className="text-xs font-black uppercase tracking-widest">100% Anonymous</span>
              </div>

              <h2 className="mb-2 text-2xl font-black tracking-tight text-[var(--text-primary)]">{postData?.title || "Send Feedback"}</h2>
              <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">{postData?.description || "Be honest. The recipient will never know who you are."}</p>
              <p className="mb-8 text-xs text-[var(--text-muted)] font-medium">This page is branded for the creator, but your message stays anonymous.</p>

              {postData ? (
                <PostPreview {...postData} accentColor={accentColor} />
              ) : status === "error" ? (
                <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
                  ⚠️ {errorMsg}
                </div>
              ) : (
                <div className="mb-6 h-32 w-full animate-pulse rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-xs text-gray-500 font-medium">Loading content...</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Write your honest thoughts here..."
                  className="min-h-[160px] w-full resize-y rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 text-base text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                />
                {status === "error" && (
                  <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-400">{errorMsg}</div>
                )}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={status === "submitting" || !message.trim()}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-main transition-all disabled:opacity-50"
                  style={{ background: accentColor }}
                >
                  {status === "submitting" ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-main/30 border-t-main" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Anonymously
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
