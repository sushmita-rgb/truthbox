import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ShieldCheck, CheckCircle, FileUp, Film, Globe, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import api from "../api";

const BACKEND = "http://localhost:5000";

function PostPreview({ postType, content, fileUrl, fileName }) {
  if (!postType || postType === "text") return content ? (
    <div className="mb-6 p-5 rounded-2xl bg-white/5 border border-white/10 text-gray-200 text-sm leading-relaxed">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 uppercase tracking-wide font-semibold"><FileText size={13} />Post</div>
      <p>{content}</p>
    </div>
  ) : null;

  if (postType === "url") return (
    <div className="mb-6 p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20">
      <div className="flex items-center gap-2 text-xs text-orange-400 mb-3 uppercase tracking-wide font-semibold"><Globe size={13} />Shared Link</div>
      <a href={content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-300 hover:text-orange-200 transition-colors break-all text-sm">
        <ExternalLink size={14} className="shrink-0" />{content}
      </a>
    </div>
  );

  if (postType === "image") return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-white/10">
      <div className="flex items-center gap-2 text-xs text-blue-400 p-3 bg-white/5 uppercase tracking-wide font-semibold"><ImageIcon size={13} />Shared Image</div>
      <img src={`${BACKEND}${fileUrl}`} alt={fileName || "image"} className="w-full max-h-[360px] object-contain bg-black/30" />
      {content && <p className="p-4 text-sm text-gray-400 bg-white/5 border-t border-white/10">{content}</p>}
    </div>
  );

  if (postType === "pdf") return (
    <div className="mb-6 p-5 rounded-2xl bg-pink-500/10 border border-pink-500/20">
      <div className="flex items-center gap-2 text-xs text-pink-400 mb-3 uppercase tracking-wide font-semibold"><FileUp size={13} />Shared PDF</div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center shrink-0"><FileUp size={22} className="text-pink-400" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate text-sm">{fileName || "Document.pdf"}</p>
          {content && <p className="text-xs text-gray-400 mt-1">{content}</p>}
        </div>
        <a href={`${BACKEND}${fileUrl}`} target="_blank" rel="noopener noreferrer"
          className="shrink-0 px-4 py-2 rounded-xl bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 transition-colors text-sm font-medium flex items-center gap-1">
          <ExternalLink size={13} />View
        </a>
      </div>
    </div>
  );

  if (postType === "video") return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-white/10">
      <div className="flex items-center gap-2 text-xs text-purple-400 p-3 bg-white/5 uppercase tracking-wide font-semibold"><Film size={13} />Shared Video</div>
      <video src={`${BACKEND}${fileUrl}`} controls className="w-full max-h-[360px] bg-black" />
      {content && <p className="p-4 text-sm text-gray-400 bg-white/5 border-t border-white/10">{content}</p>}
    </div>
  );
  return null;
}

export default function FeedbackPage() {
  const { linkId } = useParams();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [postData, setPostData] = useState(null);

  useEffect(() => {
    api.get(`/links/${linkId}`).then(r => setPostData(r.data)).catch(() => {});
  }, [linkId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("submitting");
    try {
      await api.post(`/feedback/send-feedback/${linkId}`, { message });
      setStatus("success"); setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Failed to send. The link might be invalid.");
    }
  };

  return (
    <div className="relative min-h-screen bg-main/80 flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden">
      <div className="relative z-10 w-full max-w-lg">
        <Link to="/" className="inline-block mb-10 hover:scale-105 transition-transform">
          <h1 className="text-4xl font-extrabold tracking-tight font-heading text-center">Truth<span className="text-accent">Box</span></h1>
        </Link>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="rounded-3xl p-10 text-center space-y-5 border border-white/10"
              style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-accent" />
              </motion.div>
              <h2 className="text-3xl font-bold font-heading">Feedback Sent!</h2>
              <p className="text-gray-400">Your anonymous message was delivered securely.</p>
              <Link to="/signup" className="inline-block mt-4 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-medium text-sm">
                Get your own TruthBox →
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-3xl p-8 md:p-10 border border-white/10"
              style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)" }}>
              <div className="flex items-center gap-3 mb-6 px-4 py-2 bg-accent/10 text-accent rounded-full w-fit">
                <ShieldCheck size={16} /><span className="text-sm font-semibold">100% Anonymous</span>
              </div>
              <h2 className="text-2xl font-bold font-heading mb-2">Send Feedback</h2>
              <p className="text-gray-400 text-sm mb-6">Be honest. The recipient will never know who you are.</p>

              {postData && <PostPreview {...postData} />}

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea value={message} onChange={e => setMessage(e.target.value)} required
                  placeholder="Write your honest thoughts here..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-base min-h-[160px] focus:outline-none focus:border-accent transition-colors resize-y text-white placeholder:text-gray-600" />
                {status === "error" && (
                  <div className="text-red-400 text-sm bg-red-400/10 p-4 rounded-xl border border-red-400/20">{errorMsg}</div>
                )}
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={status === "submitting" || !message.trim()}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent text-main font-bold text-base disabled:opacity-50 transition-all">
                  {status === "submitting"
                    ? <><span className="w-5 h-5 border-2 border-main/30 border-t-main rounded-full animate-spin" />Sending...</>
                    : <><Send size={18} />Send Anonymously</>
                  }
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
