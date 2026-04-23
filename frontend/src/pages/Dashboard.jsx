import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle,
  Copy,
  FileText,
  FileUp,
  Film,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import api from "../api";
import ProfileDropdown from "../components/ProfileDropdown";
import SettingsModal from "../components/SettingsModal";
import TermsModal from "../components/TermsModal";

const BACKEND_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const POST_TYPES = [
  { id: "text", label: "Text", icon: FileText, color: "#97ce23", desc: "Publish a written prompt for structured feedback" },
  { id: "image", label: "Image", icon: ImageIcon, color: "#60a5fa", desc: "Share a visual asset for review and comments" },
  { id: "pdf", label: "PDF", icon: FileUp, color: "#f472b6", desc: "Upload a document, brief, or report for review" },
  { id: "video", label: "Video", icon: Film, color: "#a78bfa", desc: "Share a video clip and collect responses" },
  { id: "url", label: "URL", icon: Globe, color: "#fb923c", desc: "Request feedback on a website or external page" },
];

const NAV = [
  { id: "create", label: "Create", icon: Plus },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "links", label: "My Links", icon: LinkIcon },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
];

const TEMPLATE_PRESETS = [
  {
    id: "portfolio",
    label: "Portfolio Review",
    postType: "url",
    title: "Portfolio Feedback",
    description: "Tell me what stands out, what feels weak, and what I should improve first.",
    content: "https://your-portfolio.com",
    accentColor: "#7c3aed",
    templateKey: "portfolio",
  },
  {
    id: "launch",
    label: "Launch Copy",
    postType: "text",
    title: "Launch Messaging",
    description: "Help me sharpen this product message before I publish it.",
    content: "Would you immediately understand the value from this copy?",
    accentColor: "#fb923c",
    templateKey: "launch",
  },
  {
    id: "content",
    label: "Content Feedback",
    postType: "text",
    title: "Content Review",
    description: "I want blunt but useful feedback on my writing or caption.",
    content: "Does this sound confident and clear?",
    accentColor: "#38bdf8",
    templateKey: "content",
  },
  {
    id: "brand",
    label: "Personal Brand",
    postType: "image",
    title: "Profile Image Review",
    description: "Let me know what impression this photo and visual style create.",
    content: "",
    accentColor: "#97ce23",
    templateKey: "brand",
  },
];

const card = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function Dashboard() {
  const [feedback, setFeedback] = useState([]);
  const [links, setLinks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("create");
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [postType, setPostType] = useState("text");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [branding, setBranding] = useState({
    title: "",
    description: "",
    accentColor: "#97ce23",
    templateKey: "custom",
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const avatarUrl = user?.avatar
    ? (user.avatar.startsWith("/uploads") ? `${BACKEND_URL}${user.avatar}` : user.avatar)
    : null;

  const activeType = POST_TYPES.find((type) => type.id === postType);
  const latestLink = links[0] || null;

  const loadCollections = async () => {
    const [fbRes, linksRes, analyticsRes] = await Promise.all([
      api.get("/feedback/my-feedback"),
      api.get("/links/my-links"),
      api.get("/links/analytics"),
    ]);

    setFeedback(fbRes.data);
    setLinks(linksRes.data);
    setAnalytics(analyticsRes.data);
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const userRes = await api.get("/auth/me");
      setUser(userRes.data);

      if (!userRes.data.termsAccepted) {
        setShowTermsModal(true);
        return;
      }

      await loadCollections();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleAcceptTerms = async () => {
    try {
      await api.post("/auth/accept-terms");
      setShowTermsModal(false);
      setUser((prev) => (prev ? { ...prev, termsAccepted: true } : prev));
      await loadCollections();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept terms. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    if (postType === "image") {
      const reader = new FileReader();
      reader.onload = (event) => setFilePreview(event.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const switchType = (type) => {
    setPostType(type);
    setContent("");
    clearFile();
    setGeneratedLink(null);
    setBranding((prev) => ({ ...prev, templateKey: "custom" }));
  };

  const applyTemplate = (template) => {
    setPostType(template.postType);
    setContent(template.content);
    setBranding({
      title: template.title,
      description: template.description,
      accentColor: template.accentColor,
      templateKey: template.templateKey,
    });
    setGeneratedLink(null);
    clearFile();
  };

  const handleSubmit = async () => {
    if (postType === "text" && !content.trim()) return alert("Please enter the prompt you want reviewed.");
    if (postType === "url" && !content.trim()) return alert("Please enter the URL you want reviewed.");
    if (["image", "pdf", "video"].includes(postType) && !file) return alert("Please select a file before continuing.");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("postType", postType);
      if (content) formData.append("content", content);
      if (file) formData.append("file", file);
      formData.append("title", branding.title);
      formData.append("description", branding.description);
      formData.append("accentColor", branding.accentColor);
      formData.append("templateKey", branding.templateKey);

      const res = await api.post("/links/create-link", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setGeneratedLink(res.data.linkId);
      setContent("");
      clearFile();
      setBranding((prev) => ({ ...prev, templateKey: "custom" }));

      await loadCollections();
      setActiveNav("links");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to create the feedback request.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/feedback/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleNavSelect = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-gray-400 font-sans">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {showTermsModal && <TermsModal onAccept={handleAcceptTerms} />}
      {showSettingsModal && user && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettingsModal(false)}
          onUpdate={setUser}
          onLogout={handleLogout}
        />
      )}

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black/60"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-0 left-0 z-40 h-full w-[290px] border-r border-white/10 bg-[#090909] p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-extrabold font-heading">
                  Truth<span className="text-accent">Box</span>
                </h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {NAV.map(({ id, label, icon: Icon }) => {
                  const active = activeNav === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleNavSelect(id)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-semibold transition-colors ${
                        active ? "bg-accent/15 text-accent" : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{label}</span>
                      {id === "feedback" && feedback.length > 0 && (
                        <span className="ml-auto w-5 h-5 rounded-full bg-accent text-black text-xs flex items-center justify-center font-bold">
                          {feedback.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-auto space-y-2">
                <button
                  onClick={() => {
                    setShowSettingsModal(true);
                    setSidebarOpen(false);
                    setShowProfileCard(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-semibold"
                >
                  <Settings size={18} />
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-semibold"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-20 border-b border-white/10 bg-black/96"
      >
        <div className="flex items-center justify-between px-5 md:px-8 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Menu size={18} />
            </button>
            <div>
              <h2 className="text-2xl font-bold font-heading">
                {activeNav === "create" && "Create Post"}
                {activeNav === "analytics" && "Analytics Dashboard"}
                {activeNav === "links" && "My Links"}
                {activeNav === "feedback" && "Received Feedback"}
              </h2>
              <p className="text-sm text-gray-500">
                Signed in as <span className="text-accent">{user?.username}</span>
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <button className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Bell size={18} className="text-gray-300" />
            </button>
            <button
              onClick={() => setShowProfileCard((prev) => !prev)}
              className="w-11 h-11 rounded-full overflow-hidden border border-[#97ce23]/40 bg-[#111111] hover:border-[#97ce23]/70 transition-colors flex items-center justify-center"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-accent" />
              )}
            </button>
            {showProfileCard && <ProfileDropdown user={user} onClose={() => setShowProfileCard(false)} />}
          </div>
        </div>
      </motion.header>

      <main className="px-5 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeNav === "create" && (
            <motion.div
              key="create"
              variants={stagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 xl:grid-cols-5 gap-6"
            >
              <motion.div
                variants={card}
                className="xl:col-span-3 rounded-3xl p-7 space-y-6 border border-white/10 bg-[#111111]"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Templates</p>
                    <h3 className="mt-2 text-xl font-bold">Start from a polished prompt</h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent">
                    <Sparkles size={14} />
                    Faster setup
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {TEMPLATE_PRESETS.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="rounded-3xl border border-white/10 bg-black/30 p-4 text-left transition-all hover:-translate-y-1 hover:border-accent/30 hover:bg-white/5"
                    >
                      <div
                        className="mb-4 h-10 w-10 rounded-2xl"
                        style={{ background: `${template.accentColor}20`, border: `1px solid ${template.accentColor}40` }}
                      />
                      <p className="text-sm font-semibold text-white">{template.label}</p>
                      <p className="mt-2 text-xs leading-6 text-gray-500">{template.description}</p>
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {POST_TYPES.map((type) => {
                    const Icon = type.icon;
                    const active = postType === type.id;
                    return (
                      <motion.button
                        key={type.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => switchType(type.id)}
                        style={active ? { borderColor: type.color, color: type.color, background: `${type.color}18` } : {}}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                          active ? "shadow-lg" : "border-white/10 text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon size={15} />
                        {type.label}
                      </motion.button>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500">{activeType?.desc}</p>

                <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-4">
                    {postType === "text" && (
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={7}
                        placeholder="Ask a question or write something you want feedback on..."
                        className="w-full p-5 rounded-2xl bg-black border border-white/10 text-white outline-none focus:border-accent/50 transition-colors resize-none placeholder:text-gray-600 text-base"
                      />
                    )}

                    {postType === "url" && (
                      <div className="flex items-center gap-3 bg-black border border-white/10 rounded-2xl px-5 py-4 focus-within:border-orange-400/50 transition-colors">
                        <Globe size={20} className="text-orange-400 shrink-0" />
                        <input
                          type="url"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="https://your-website.com"
                          className="bg-transparent flex-1 focus:outline-none text-white placeholder:text-gray-600 text-base"
                        />
                      </div>
                    )}

                    {["image", "pdf", "video"].includes(postType) && (
                      <div className="space-y-3">
                        {!file ? (
                          <label
                            className="relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all hover:opacity-80"
                            style={{ borderColor: `${activeType?.color}50`, background: `${activeType?.color}08` }}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept={postType === "image" ? "image/*" : postType === "pdf" ? "application/pdf" : "video/*"}
                              onChange={handleFileChange}
                            />
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${activeType?.color}20` }}>
                              {postType === "image" && <ImageIcon size={28} style={{ color: activeType?.color }} />}
                              {postType === "pdf" && <FileUp size={28} style={{ color: activeType?.color }} />}
                              {postType === "video" && <Film size={28} style={{ color: activeType?.color }} />}
                            </div>
                            <p className="font-semibold text-gray-300">
                              Click to upload {postType === "image" ? "an image" : postType === "pdf" ? "a PDF" : "a video"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {postType === "image" ? "JPG, PNG, GIF, WebP" : postType === "pdf" ? "PDF files" : "MP4, WebM, MOV"} up to 50MB
                            </p>
                          </label>
                        ) : (
                          <div className="rounded-2xl border border-white/10 bg-black p-4 flex items-start gap-4">
                            {postType === "image" && filePreview && <img src={filePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl" />}
                            {postType === "pdf" && <div className="w-16 h-16 bg-pink-500/20 rounded-xl flex items-center justify-center"><FileUp size={28} className="text-pink-400" /></div>}
                            {postType === "video" && <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center"><Film size={28} className="text-purple-400" /></div>}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{file.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1048576).toFixed(2)} MB</p>
                            </div>
                            <button onClick={clearFile} className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                              <X size={16} />
                            </button>
                          </div>
                        )}

                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={3}
                          placeholder="Add a caption or question (optional)..."
                          className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white outline-none focus:border-white/20 resize-none placeholder:text-gray-600 text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Branding</p>
                      <h4 className="mt-2 font-bold text-white">Custom link appearance</h4>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-400">Title</label>
                      <input
                        value={branding.title}
                        onChange={(e) => setBranding({ ...branding, title: e.target.value })}
                        placeholder="Feedback Request"
                        className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition-colors focus:border-accent/50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-400">Short description</label>
                      <textarea
                        value={branding.description}
                        onChange={(e) => setBranding({ ...branding, description: e.target.value })}
                        placeholder="Tell people what you want feedback on."
                        rows={4}
                        className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition-colors focus:border-accent/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-400">Accent color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={branding.accentColor}
                          onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                          className="h-12 w-16 cursor-pointer rounded-xl border border-white/10 bg-black/50 p-1"
                        />
                        <input
                          value={branding.accentColor}
                          onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                          className="flex-1 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition-colors focus:border-accent/50"
                        />
                      </div>
                    </div>

                    <div
                      className="rounded-3xl border border-white/10 p-4"
                      style={{ background: `${branding.accentColor}10` }}
                    >
                      <p className="text-xs uppercase tracking-[0.2em]" style={{ color: branding.accentColor }}>
                        Preview
                      </p>
                      <p className="mt-2 text-lg font-bold text-white">{branding.title || "Your branded feedback page"}</p>
                      <p className="mt-2 text-sm leading-7 text-gray-400">
                        {branding.description || "A polished feedback page that feels like part of your brand."}
                      </p>
                      <div
                        className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black"
                        style={{ background: branding.accentColor }}
                      >
                        Copy-ready share link
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl font-bold text-black text-base shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: branding.accentColor }}
                >
                  {submitting ? "Generating..." : "Post & Generate Feedback Link"}
                </motion.button>

                <AnimatePresence>
                  {generatedLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 rounded-2xl border border-accent/30 bg-accent/10 p-5"
                    >
                      <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                        <CheckCircle size={16} />
                        Link ready
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex-1 truncate rounded-xl border border-white/10 bg-black px-4 py-3 font-mono text-xs text-gray-300">
                          {window.location.origin}/feedback/{generatedLink}
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyLink(generatedLink)}
                          className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-black text-sm transition-colors"
                          style={{ background: copied ? "#22c55e" : branding.accentColor }}
                        >
                          {copied ? <><CheckCircle size={16} />Copied</> : <><Copy size={16} />Copy</>}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="xl:col-span-2 flex flex-col gap-6">
                <motion.div variants={card} className="rounded-3xl p-6 border border-white/10 bg-[#111111] space-y-4">
                  <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                    <Zap size={16} />
                    Quick metrics
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Messages", value: analytics?.summary?.totalResponses ?? feedback.length },
                      { label: "This week", value: analytics?.summary?.responsesThisWeek ?? 0 },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/5 bg-black p-4 text-center">
                        <p className="text-3xl font-bold text-accent font-heading">{item.value}</p>
                        <p className="mt-1 text-xs text-gray-500">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Latest link</p>
                    {latestLink ? (
                      <>
                        <p className="mt-2 font-semibold text-white">{latestLink.title || latestLink.templateKey || latestLink.postType}</p>
                        <p className="mt-1 text-sm text-gray-500">{latestLink.responseCount || 0} responses</p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">Create your first branded link to see it here.</p>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={card} className="rounded-3xl p-6 border border-white/10 bg-[#111111] flex-1">
                  <p className="text-xs uppercase font-semibold tracking-widest mb-3 text-gray-500">Quick Tip</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Use a template to get the wording right, then customize the title and accent color so the page feels owned.
                  </p>
                  <button
                    onClick={() => setActiveNav("analytics")}
                    className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                  >
                    See your analytics
                    <ArrowRight size={12} />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeNav === "analytics" && (
            <motion.div
              key="analytics"
              variants={stagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Total links", value: analytics?.summary?.totalLinks ?? 0 },
                  { label: "Active links", value: analytics?.summary?.activeLinks ?? 0 },
                  { label: "Total responses", value: analytics?.summary?.totalResponses ?? feedback.length },
                  { label: "Responses this week", value: analytics?.summary?.responsesThisWeek ?? 0 },
                ].map((item) => (
                  <motion.div key={item.label} variants={card} className="rounded-3xl border border-white/10 bg-[#111111] p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{item.label}</p>
                    <p className="mt-4 text-4xl font-extrabold text-accent">{item.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <motion.div variants={card} className="rounded-3xl border border-white/10 bg-[#111111] p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Last 7 days</p>
                      <h3 className="mt-2 text-xl font-bold">Response trend</h3>
                    </div>
                    <BarChart3 className="text-accent" size={18} />
                  </div>

                  <div className="mt-8 grid grid-cols-7 gap-3 items-end h-56">
                    {(analytics?.dailyResponses || []).map((item) => {
                      const maxValue = Math.max(...(analytics?.dailyResponses || []).map((day) => day.value), 1);
                      const height = Math.max((item.value / maxValue) * 100, item.value ? 18 : 10);
                      return (
                        <div key={item.label} className="flex flex-col items-center gap-3">
                          <div className="flex h-44 w-full items-end justify-center">
                            <div
                              className="w-full max-w-10 rounded-t-2xl"
                              style={{
                                height: `${height}%`,
                                background: `linear-gradient(180deg, ${branding.accentColor}, rgba(151,206,35,0.2))`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div variants={card} className="rounded-3xl border border-white/10 bg-[#111111] p-6 space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">By post type</p>
                    <h3 className="mt-2 text-xl font-bold">Where the responses are coming from</h3>
                  </div>

                  <div className="space-y-4">
                    {POST_TYPES.map((type) => {
                      const count = analytics?.responseByType?.[type.id] || 0;
                      return (
                        <div key={type.id} className="rounded-2xl border border-white/10 bg-black/45 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${type.color}18` }}>
                                <type.icon size={18} style={{ color: type.color }} />
                              </div>
                              <div>
                                <p className="font-semibold text-white">{type.label}</p>
                                <p className="text-xs text-gray-500">{type.desc}</p>
                              </div>
                            </div>
                            <span className="text-2xl font-bold text-accent">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {analytics?.topLink && (
                    <div className="rounded-3xl border border-accent/20 bg-accent/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-accent">Top link</p>
                      <p className="mt-2 font-semibold text-white">
                        {analytics.topLink.title || analytics.topLink.templateKey || analytics.topLink.postType}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">{analytics.topLink.responseCount || 0} responses</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeNav === "links" && (
            <motion.div
              key="links"
              variants={stagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {links.length === 0 ? (
                <motion.div variants={card} className="rounded-3xl border border-white/10 bg-[#111111] p-10 text-center">
                  <LinkIcon size={48} className="mx-auto mb-4 text-gray-700" />
                  <p className="font-semibold text-gray-300">No links yet</p>
                  <p className="mt-1 text-sm text-gray-600">Create a branded feedback page to start collecting responses.</p>
                  <button
                    onClick={() => setActiveNav("create")}
                    className="mt-6 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-black"
                  >
                    Create a post
                  </button>
                </motion.div>
              ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                  {links.map((link) => {
                    const linkColor = link.accentColor || "#97ce23";
                    const responseCount = link.responseCount || 0;
                    return (
                      <motion.div
                        key={link._id}
                        variants={card}
                        className="rounded-3xl border border-white/10 bg-[#111111] p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="rounded-full px-3 py-1 text-xs font-semibold text-black" style={{ background: linkColor }}>
                                {link.postType.toUpperCase()}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                                {responseCount} responses
                              </span>
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-white">
                              {link.title || link.templateKey || "Untitled link"}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-gray-400">
                              {link.description || "No description was added for this link."}
                            </p>
                          </div>
                          <div className="h-12 w-12 rounded-2xl border border-white/10" style={{ background: `${linkColor}18` }} />
                        </div>

                        <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Share URL</p>
                          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                            <div className="flex-1 truncate rounded-xl border border-white/10 bg-black px-4 py-3 font-mono text-xs text-gray-300">
                              {window.location.origin}/feedback/{link.linkId}
                            </div>
                            <button
                              onClick={() => copyLink(link.linkId)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-black"
                              style={{ background: linkColor }}
                            >
                              <Copy size={15} />
                              Copy
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeNav === "feedback" && (
            <motion.div
              key="feedback"
              variants={stagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {feedback.length === 0 ? (
                <motion.div variants={card} className="p-16 rounded-3xl border border-white/10 text-center bg-[#111111]">
                  <MessageSquare size={48} className="mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-400 font-semibold">No messages yet</p>
                  <p className="text-gray-600 text-sm mt-1">Share your link to start collecting honest feedback.</p>
                  <button
                    onClick={() => setActiveNav("create")}
                    className="mt-6 px-6 py-3 rounded-2xl bg-accent/10 text-accent text-sm font-semibold hover:bg-accent/20 transition-colors"
                  >
                    Create a post
                  </button>
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {feedback.map((message) => (
                    <motion.div
                      key={message._id}
                      variants={card}
                      whileHover={{ y: -4 }}
                      className="rounded-3xl p-6 relative overflow-hidden border border-white/10 transition-all cursor-default bg-[#111111]"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-l-3xl" />
                      <p className="text-gray-200 text-sm leading-relaxed pl-3">{message.message}</p>
                      <div className="flex items-center justify-between mt-5 pl-3">
                        <span className="text-xs bg-white/5 px-3 py-1 rounded-full text-gray-500">Anonymous</span>
                        <span className="text-xs text-gray-600">{new Date(message.createdAt).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
