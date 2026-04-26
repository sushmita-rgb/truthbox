import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ShieldCheck, CheckCircle, FileUp, Film, Globe, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import api from "../api";
import TermsModal from "../components/TermsModal";

const BACKEND = "https://truthbox-production.up.railway.app";

function PostPreview({ postType, content, fileUrl, fileName, accentColor }) {
  if (!postType || postType === "text") {
    return content ? (
      <div className="mb-6 rounded-2xl border p-5 text-sm leading-relaxed text-gray-200" style={{ background: `${accentColor}10`, borderColor: `${accentColor}26` }}>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: accentColor }}>
          <FileText size={13} />
          Post
        </div>
        <p>{content}</p>
      </div>
    ) : null;
  }

  if (postType === "url") {
    return (
      <div className="mb-6 rounded-2xl border p-5" style={{ background: `${accentColor}10`, borderColor: `${accentColor}30` }}>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: accentColor }}>
          <Globe size={13} />
          Shared Link
        </div>
        <a href={content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 break-all text-sm transition-colors hover:opacity-80" style={{ color: accentColor }}>
          <ExternalLink size={14} className="shrink-0" />
          {content}
        </a>
      </div>
    );
  }

  if (postType === "image") {
    return (
      <div className="mb-6 overflow-hidden rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 bg-white/5 p-3 text-xs font-semibold uppercase tracking-wide text-blue-400">
          <ImageIcon size={13} />
          Shared Image
        </div>
        <img src={`${BACKEND}${fileUrl}`} alt={fileName || "image"} className="w-full max-h-[360px] bg-black/30 object-contain" />
        {content && <p className="border-t border-white/10 bg-white/5 p-4 text-sm text-gray-400">{content}</p>}
      </div>
    );
  }

  if (postType === "pdf") {
    return (
      <div className="mb-6 rounded-2xl border p-5" style={{ background: `${accentColor}10`, borderColor: `${accentColor}30` }}>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: accentColor }}>
          <FileUp size={13} />
          Shared PDF
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accentColor}20` }}>
            <FileUp size={22} style={{ color: accentColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{fileName || "Document.pdf"}</p>
            {content && <p className="mt-1 text-xs text-gray-400">{content}</p>}
          </div>
          <a
            href={`${BACKEND}${fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            style={{ background: `${accentColor}22`, color: accentColor }}
          >
            View
          </a>
        </div>
      </div>
    );
  }

  if (postType === "video") {
    return (
      <div className="mb-6 overflow-hidden rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 bg-white/5 p-3 text-xs font-semibold uppercase tracking-wide text-purple-400">
          <Film size={13} />
          Shared Video
        </div>
        <video src={`${BACKEND}${fileUrl}`} controls className="w-full max-h-[360px] bg-black" />
        {content && <p className="border-t border-white/10 bg-white/5 p-4 text-sm text-gray-400">{content}</p>}
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
    api.get(`/links/${linkId}`).then((r) => setPostData(r.data)).catch(() => {});
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
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 text-white font-sans"
      style={{
        background: `radial-gradient(circle at top, ${accentColor}26, transparent 32%), linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.72))`,
      }}
    >
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
              className="space-y-5 rounded-3xl border border-white/10 p-10 text-center"
              style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: `${accentColor}20` }}
              >
                <CheckCircle className="h-10 w-10" style={{ color: accentColor }} />
              </motion.div>
              <h2 className="text-3xl font-bold font-heading">Feedback Sent!</h2>
              <p className="text-gray-400">Your anonymous message was delivered securely.</p>
              <Link to="/signup" className="mt-4 inline-block rounded-full bg-white/10 px-8 py-3 text-sm font-medium transition-colors hover:bg-white/20">
                Get your own Verit →
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-white/10 p-8 md:p-10"
              style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)" }}
            >
              <div className="mb-6 flex w-fit items-center gap-3 rounded-full px-4 py-2" style={{ background: `${accentColor}15`, color: accentColor }}>
                <ShieldCheck size={16} />
                <span className="text-sm font-semibold">100% Anonymous</span>
              </div>

              <h2 className="mb-2 text-2xl font-bold font-heading">{postData?.title || "Send Feedback"}</h2>
              <p className="mb-2 text-sm text-gray-400">{postData?.description || "Be honest. The recipient will never know who you are."}</p>
              <p className="mb-6 text-xs text-gray-500">This page is branded for the creator, but your message stays anonymous.</p>

              {postData && <PostPreview {...postData} accentColor={accentColor} />}

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Write your honest thoughts here..."
                  className="min-h-[160px] w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-5 text-base text-white outline-none transition-colors placeholder:text-gray-600 focus:border-accent"
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
