import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link as LinkIcon, MessageSquare,
  LogOut, FileText, Image as ImageIcon, Film, Globe, FileUp,
  CheckCircle, Copy, X, Bell, User, Plus, Zap
} from "lucide-react";
import api from "../api";

const POST_TYPES = [
  { id: "text",  label: "Text",  icon: FileText,  color: "#97ce23", desc: "Ask a question or write a message" },
  { id: "image", label: "Image", icon: ImageIcon, color: "#60a5fa", desc: "Share a photo or graphic" },
  { id: "pdf",   label: "PDF",   icon: FileUp,    color: "#f472b6", desc: "Share a document or report" },
  { id: "video", label: "Video", icon: Film,      color: "#a78bfa", desc: "Share a video clip" },
  { id: "url",   label: "URL",   icon: Globe,     color: "#fb923c", desc: "Share a website or link" },
];

const NAV = [
  { id: "create",   label: "Create",   icon: Plus },
  { id: "links",    label: "My Links", icon: LinkIcon },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
];

const card = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function Dashboard() {
  const [feedback, setFeedback]     = useState([]);
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeNav, setActiveNav]   = useState("create");
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied]         = useState(false);
  const [postType, setPostType]     = useState("text");
  const [content, setContent]       = useState("");
  const [file, setFile]             = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [fbRes, userRes] = await Promise.all([
          api.get("/feedback/my-feedback"),
          api.get("/auth/me"),
        ]);
        setFeedback(fbRes.data);
        setUser(userRes.data);
      } catch (err) {
        if (err.response?.status === 401) { localStorage.removeItem("token"); navigate("/login"); }
      } finally { setLoading(false); }
    })();
  }, [navigate]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (postType === "image") {
      const r = new FileReader();
      r.onload = (ev) => setFilePreview(ev.target.result);
      r.readAsDataURL(f);
    } else setFilePreview(null);
  };

  const clearFile = () => { setFile(null); setFilePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const switchType = (t) => { setPostType(t); setContent(""); clearFile(); setGeneratedLink(null); };

  const handleSubmit = async () => {
    if (postType === "text" && !content.trim()) return alert("Enter some text.");
    if (postType === "url"  && !content.trim()) return alert("Enter a URL.");
    if (["image","pdf","video"].includes(postType) && !file) return alert("Select a file.");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("postType", postType);
      if (content) fd.append("content", content);
      if (file) fd.append("file", file);
      const res = await api.post("/links/create-link", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setGeneratedLink(res.data.linkId);
      setContent(""); clearFile();
      const fb = await api.get("/feedback/my-feedback");
      setFeedback(fb.data);
    } catch (err) { alert(err.response?.data?.message || "Failed to create post"); }
    finally { setSubmitting(false); }
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/feedback/${id}`);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const activeType = POST_TYPES.find(t => t.id === postType);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-main">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span className="text-gray-400 font-sans">Loading your dashboard...</span>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-main/80 text-white font-sans overflow-hidden">

      {/* ── Layout ── */}
      <div className="flex min-h-screen">

        {/* ── Sidebar ── */}
        <motion.aside
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="hidden md:flex flex-col w-20 lg:w-64 shrink-0 min-h-screen py-8 px-3 lg:px-5 border-r border-white/5"
          style={{ background: "rgba(20,20,20,0.6)", backdropFilter: "blur(24px)" }}
        >
          {/* Logo */}
          <div className="mb-10 px-2">
            <h1 className="text-xl font-extrabold font-heading hidden lg:block">
              Truth<span className="text-accent">Box</span>
            </h1>
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center lg:hidden">
              <Zap size={16} className="text-main" />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-2 flex-1">
            {NAV.map(({ id, label, icon: Icon }) => {
              const active = activeNav === id;
              return (
                <motion.button
                  key={id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveNav(id)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-sm font-semibold w-full ${
                    active ? "bg-accent/15 text-accent" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <Icon size={20} className={active ? "text-accent" : ""} />
                  <span className="hidden lg:block">{label}</span>
                  {id === "feedback" && feedback.length > 0 && (
                    <span className="hidden lg:flex ml-auto w-5 h-5 rounded-full bg-accent text-main text-xs items-center justify-center font-bold">
                      {feedback.length}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <User size={16} className="text-accent" />
              </div>
              <div className="hidden lg:block min-w-0">
                <p className="text-sm font-semibold truncate">{user?.username}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { localStorage.removeItem("token"); navigate("/"); }}
              className="flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-sm font-semibold"
            >
              <LogOut size={20} />
              <span className="hidden lg:block">Logout</span>
            </motion.button>
          </div>
        </motion.aside>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto min-h-screen">
          {/* Top Bar */}
          <motion.header
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="sticky top-0 z-20 flex items-center justify-between px-6 lg:px-10 py-5 border-b border-white/5"
            style={{ background: "rgba(20,20,20,0.7)", backdropFilter: "blur(24px)" }}
          >
            <div>
              <h2 className="text-xl font-bold font-heading">
                {activeNav === "create"   && "Create Post"}
                {activeNav === "links"    && "My Links"}
                {activeNav === "feedback" && "Received Feedback"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Welcome back, <span className="text-accent">{user?.username}</span> 👋</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10">
                <Bell size={16} className="text-gray-400" />
              </button>
              {/* Mobile nav pills */}
              <div className="flex md:hidden gap-1">
                {NAV.map(({ id, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveNav(id)}
                    className={`p-2 rounded-xl transition-colors ${activeNav === id ? "bg-accent/20 text-accent" : "text-gray-500 hover:text-white"}`}>
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>
          </motion.header>

          <div className="p-6 lg:p-10 space-y-8">

            {/* ── CREATE PANEL ── */}
            <AnimatePresence mode="wait">
              {activeNav === "create" && (
                <motion.div key="create"
                  variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 xl:grid-cols-5 gap-6"
                >
                  {/* Post Creator — large card */}
                  <motion.div variants={card} className="xl:col-span-3 rounded-3xl p-7 space-y-6 border border-white/8"
                    style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)" }}>
                    {/* Type tabs */}
                    <div className="flex flex-wrap gap-2">
                      {POST_TYPES.map(t => {
                        const Icon = t.icon;
                        const on = postType === t.id;
                        return (
                          <motion.button key={t.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                            onClick={() => switchType(t.id)}
                            style={on ? { borderColor: t.color, color: t.color, background: `${t.color}18` } : {}}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                              on ? "shadow-lg" : "border-white/10 text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <Icon size={15} />{t.label}
                          </motion.button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500">{activeType?.desc}</p>

                    {/* Inputs */}
                    {postType === "text" && (
                      <textarea value={content} onChange={e => setContent(e.target.value)} rows={6}
                        placeholder="Ask a question or write something you want feedback on..."
                        className="w-full p-5 rounded-2xl bg-black/40 border border-white/10 text-white outline-none focus:border-accent/50 transition-colors resize-none placeholder:text-gray-600 text-base"
                      />
                    )}
                    {postType === "url" && (
                      <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-orange-400/50 transition-colors">
                        <Globe size={20} className="text-orange-400 shrink-0" />
                        <input type="url" value={content} onChange={e => setContent(e.target.value)}
                          placeholder="https://your-website.com"
                          className="bg-transparent flex-1 focus:outline-none text-white placeholder:text-gray-600 text-base" />
                      </div>
                    )}
                    {["image","pdf","video"].includes(postType) && (
                      <div className="space-y-3">
                        {!file ? (
                          <label className="relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all hover:opacity-80"
                            style={{ borderColor: `${activeType?.color}50`, background: `${activeType?.color}08` }}>
                            <input ref={fileInputRef} type="file" className="absolute inset-0 opacity-0 cursor-pointer"
                              accept={postType === "image" ? "image/*" : postType === "pdf" ? "application/pdf" : "video/*"}
                              onChange={handleFileChange} />
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${activeType?.color}20` }}>
                              {postType === "image" && <ImageIcon size={28} style={{ color: activeType?.color }} />}
                              {postType === "pdf"   && <FileUp   size={28} style={{ color: activeType?.color }} />}
                              {postType === "video" && <Film     size={28} style={{ color: activeType?.color }} />}
                            </div>
                            <p className="font-semibold text-gray-300">Click to upload {postType === "image" ? "an image" : postType === "pdf" ? "a PDF" : "a video"}</p>
                            <p className="text-xs text-gray-500">{postType === "image" ? "JPG, PNG, GIF, WebP" : postType === "pdf" ? "PDF files" : "MP4, WebM, MOV"} — up to 50MB</p>
                          </label>
                        ) : (
                          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 flex items-start gap-4">
                            {postType === "image" && filePreview && <img src={filePreview} alt="preview" className="w-20 h-20 object-cover rounded-xl" />}
                            {postType === "pdf"   && <div className="w-16 h-16 bg-pink-500/20 rounded-xl flex items-center justify-center"><FileUp size={28} className="text-pink-400" /></div>}
                            {postType === "video" && <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center"><Film size={28} className="text-purple-400" /></div>}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{file.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1048576).toFixed(2)} MB</p>
                            </div>
                            <button onClick={clearFile} className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors"><X size={16} /></button>
                          </div>
                        )}
                        <textarea value={content} onChange={e => setContent(e.target.value)} rows={2}
                          placeholder="Add a caption or question (optional)..."
                          className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white outline-none focus:border-white/20 resize-none placeholder:text-gray-600 text-sm" />
                      </div>
                    )}

                    {/* Submit */}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit} disabled={submitting}
                      className="w-full py-4 rounded-2xl font-bold text-main text-base shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: activeType?.color }}>
                      {submitting
                        ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-main/30 border-t-main rounded-full animate-spin" />Generating...</span>
                        : "Post & Generate Feedback Link"
                      }
                    </motion.button>

                    {/* Generated link */}
                    <AnimatePresence>
                      {generatedLink && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="p-5 rounded-2xl border border-accent/30 space-y-3" style={{ background: "rgba(151,206,35,0.07)" }}>
                          <div className="flex items-center gap-2 text-accent font-semibold text-sm"><CheckCircle size={16} /> Link ready!</div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 px-4 py-3 bg-black/40 rounded-xl font-mono text-gray-300 text-xs border border-white/10 truncate">
                              {window.location.origin}/feedback/{generatedLink}
                            </div>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => copyLink(generatedLink)}
                              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-main text-sm transition-colors"
                              style={{ background: copied ? "#22c55e" : "#97ce23" }}>
                              {copied ? <><CheckCircle size={16} />Copied!</> : <><Copy size={16} />Copy</>}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Right bento column */}
                  <div className="xl:col-span-2 flex flex-col gap-6">
                    {/* Stats card */}
                    <motion.div variants={card} className="rounded-3xl p-6 border border-white/8 space-y-4"
                      style={{ background: "rgba(151,206,35,0.06)", backdropFilter: "blur(20px)" }}>
                      <div className="flex items-center gap-2 text-accent text-sm font-semibold"><Zap size={16} />Stats</div>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Messages",  val: feedback.length },
                          { label: "This week", val: feedback.filter(f => Date.now() - new Date(f.createdAt) < 604800000).length },
                        ].map(s => (
                          <div key={s.label} className="bg-black/30 rounded-2xl p-4 text-center">
                            <p className="text-3xl font-bold text-accent font-heading">{s.val}</p>
                            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Quick tip */}
                    <motion.div variants={card} className="rounded-3xl p-6 border border-white/8 flex-1"
                      style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-widest mb-3">Quick tip</p>
                      <p className="text-sm text-gray-300 leading-relaxed">Share your feedback link on social media, in your bio, or send it directly to get <span className="text-accent font-semibold">100% anonymous</span> responses.</p>
                      <button onClick={() => setActiveNav("feedback")}
                        className="mt-5 text-xs text-accent hover:underline flex items-center gap-1 font-semibold">
                        View all feedback <MessageSquare size={12} />
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ── FEEDBACK PANEL ── */}
              {activeNav === "feedback" && (
                <motion.div key="feedback" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }} className="space-y-5">
                  {feedback.length === 0 ? (
                    <motion.div variants={card} className="p-16 rounded-3xl border border-white/8 text-center"
                      style={{ background: "rgba(255,255,255,0.02)" }}>
                      <MessageSquare size={48} className="mx-auto mb-4 text-gray-700" />
                      <p className="text-gray-400 font-semibold">No messages yet</p>
                      <p className="text-gray-600 text-sm mt-1">Share your link to start collecting honest feedback</p>
                      <button onClick={() => setActiveNav("create")} className="mt-6 px-6 py-3 rounded-2xl bg-accent/10 text-accent text-sm font-semibold hover:bg-accent/20 transition-colors">
                        Create a post →
                      </button>
                    </motion.div>
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {feedback.map((msg) => (
                        <motion.div key={msg._id} variants={card}
                          whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(151,206,35,0.08)" }}
                          className="rounded-3xl p-6 relative overflow-hidden border border-white/8 transition-all cursor-default"
                          style={{ background: "rgba(255,255,255,0.03)" }}>
                          <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-l-3xl" />
                          <p className="text-gray-200 text-sm leading-relaxed pl-3">{msg.message}</p>
                          <div className="flex items-center justify-between mt-5 pl-3">
                            <span className="text-xs bg-white/5 px-3 py-1 rounded-full text-gray-500">Anonymous</span>
                            <span className="text-xs text-gray-600">{new Date(msg.createdAt).toLocaleDateString()}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── LINKS PANEL ── */}
              {activeNav === "links" && (
                <motion.div key="links" variants={card} initial="hidden" animate="show" exit={{ opacity: 0 }}
                  className="rounded-3xl p-10 border border-white/8 text-center"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <LinkIcon size={48} className="mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-400 font-semibold">Your links are created when you post</p>
                  <p className="text-gray-600 text-sm mt-1">Head to Create to generate a new feedback link</p>
                  <button onClick={() => setActiveNav("create")}
                    className="mt-6 px-6 py-3 rounded-2xl bg-accent text-main text-sm font-bold hover:bg-[#a5e027] transition-colors">
                    Create a post
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>
    </div>
  );
}
