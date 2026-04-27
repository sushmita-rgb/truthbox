import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Bell,
  Search,
  Check,
  CheckCircle,
  Copy,
  Crown,
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
  Trash2,
  Loader2,
  Archive,
} from "lucide-react";
import api from "../api";
import axios from "axios";
import ProfileDropdown from "../components/ProfileDropdown";
import SettingsModal from "../components/SettingsModal";
import TermsModal from "../components/TermsModal";
import PricingModal from "../components/PricingModal";
import CommandPalette from "../components/CommandPalette";
import StoryShareModal from "../components/StoryShareModal";
import { Camera } from "lucide-react";

const BACKEND_URL = "https://truthbox-production.up.railway.app";

const POST_TYPES = [
  { id: "text", label: "Text", icon: FileText, color: "#97ce23", desc: "Publish a written prompt for structured feedback" },
  { id: "image", label: "Image", icon: ImageIcon, color: "#60a5fa", desc: "Share a visual asset for review and comments" },
  { id: "video", label: "Video", icon: Film, color: "#a78bfa", desc: "Share a video clip and collect responses" },
  { id: "url", label: "URL", icon: Globe, color: "#fb923c", desc: "Request feedback on a website or external page" },
];

const NAV = [
  { id: "create", label: "Create", icon: Plus },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "links", label: "My Links", icon: LinkIcon },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "trash", label: "Trash", icon: Archive },
  { id: "plans", label: "Plans", icon: Crown },
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
  const [deletedLinks, setDeletedLinks] = useState([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [postType, setPostType] = useState("text");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [feedbackRange, setFeedbackRange] = useState("all");
  const [feedbackLinkFilter, setFeedbackLinkFilter] = useState("all");
  const [revealedMessages, setRevealedMessages] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedShareLink, setSelectedShareLink] = useState(null);
  const [selectedLinkDetails, setSelectedLinkDetails] = useState(null);
  const [unreadFeedback, setUnreadFeedback] = useState(false);
  const [branding, setBranding] = useState({
    title: "",
    description: "",
    accentColor: "#97ce23",
    templateKey: "custom",
  });
  // ── Plan / usage state
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [usage, setUsage] = useState({ plan: "free", used: 0, limit: 5, percentage: 0 });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const avatarUrl = user?.avatar
    ? (user.avatar.startsWith("/uploads") ? `${BACKEND_URL}${user.avatar}` : user.avatar)
    : null;

  const activeType = POST_TYPES.find((type) => type.id === postType);
  const latestLink = links[0] || null;
  const feedbackLinkOptions = useMemo(
    () =>
      links.map((link) => ({
        value: link.linkId,
        label: link.title || link.templateKey || link.linkId,
      })),
    [links]
  );
  const filteredFeedback = useMemo(() => {
    const now = Date.now();
    return feedback.filter((item) => {
      const matchesSearch =
        item.message.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        item.linkId.toLowerCase().includes(feedbackSearch.toLowerCase());
      const matchesRange =
        feedbackRange === "all"
          ? true
          : feedbackRange === "7d"
          ? now - new Date(item.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000
          : now - new Date(item.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000;
      const matchesLink = feedbackLinkFilter === "all" ? true : item.linkId === feedbackLinkFilter;
      return matchesSearch && matchesRange && matchesLink;
    });
  }, [feedback, feedbackSearch, feedbackRange, feedbackLinkFilter]);

  const [announcement, setAnnouncement] = useState(null);

  const loadCollections = async () => {
    const [fbRes, linksRes, analyticsRes, usageRes, announceRes] = await Promise.all([
      api.get("/feedback/my-feedback"),
      api.get("/links/my-links"),
      api.get("/links/analytics"),
      api.get("/links/usage"),
      api.get("/system/announcement").catch(() => ({ data: null })),
    ]);
    const previousCount = parseInt(localStorage.getItem("Verit.feedbackCount") || "0");
    if (fbRes.data.length > previousCount) {
      setUnreadFeedback(true);
    }
    setFeedback(fbRes.data);
    setLinks(linksRes.data);
    setAnalytics(analyticsRes.data);
    setUsage(usageRes.data);
    setAnnouncement(announceRes?.data);
  };

  const loadDeletedLinks = async () => {
    setLoadingDeleted(true);
    try {
      const res = await api.get("/links/deleted-links");
      setDeletedLinks(res.data);
    } catch (err) {
      console.error("Error loading deleted links:", err);
    } finally {
      setLoadingDeleted(false);
    }
  };

  useEffect(() => {
    if (activeNav === "links" || activeNav === "create" || activeNav === "analytics") {
      loadCollections();
    }
    if (activeNav === "trash") {
      loadDeletedLinks();
    }
  }, [activeNav]);

  const restoreSelectedTemplate = () => {
    const storedTemplate = localStorage.getItem("Verit.selectedTemplate");
    if (!storedTemplate) return;

    try {
      const template = JSON.parse(storedTemplate);
      if (!template?.id) return;

      setSelectedTemplate(template);
      setPostType(template.postType || "text");
      setContent(template.content || "");
      setBranding({
        title: template.title || "",
        description: template.summary || "",
        accentColor: template.accent || "#97ce23",
        templateKey: template.id || "custom",
      });
    } catch (err) {
      console.warn("Unable to load selected template from storage:", err);
    }
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
      restoreSelectedTemplate();

      // Auto-open PricingModal if user arrived via a plan CTA from the landing page
      const planIntent = localStorage.getItem("Verit.planIntent");
      if (planIntent && ["pro", "ultra"].includes(planIntent)) {
        localStorage.removeItem("Verit.planIntent");
        setActiveNav("plans");
        setShowPricingModal(true);
      }
    } catch (err) {
      if (err.response?.status === 401) {
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
      restoreSelectedTemplate();
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

  const clearSelectedTemplate = () => {
    localStorage.removeItem("Verit.selectedTemplate");
    setSelectedTemplate(null);
    setBranding({
      title: "",
      description: "",
      accentColor: "#97ce23",
      templateKey: "custom",
    });
  };

  const handleSubmit = async () => {
    if (postType === "text" && !content.trim()) return alert("Please enter the prompt you want reviewed.");
    if (postType === "url" && !content.trim()) return alert("Please enter the URL you want reviewed.");
    if (["image", "video"].includes(postType) && !file) return alert("Please select a file before continuing.");

    setSubmitting(true);
    try {
      let finalFileUrl = "";
      let finalFileName = "";

      // ── Step 1: Direct Upload to Cloudinary (if file exists) ──
      if (file && ["image", "video"].includes(postType)) {
        // A. Get signature from backend
        const { data: signData } = await api.get("/links/sign-upload");
        
        // B. Prepare Cloudinary FormData
        const cloudData = new FormData();
        cloudData.append("file", file);
        cloudData.append("api_key", signData.apiKey);
        cloudData.append("timestamp", signData.timestamp);
        cloudData.append("signature", signData.signature);
        cloudData.append("folder", signData.folder);

        // C. Upload directly to Cloudinary
        const cloudRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
          cloudData,
          {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            },
          }
        );

        finalFileUrl = cloudRes.data.secure_url;
        finalFileName = file.name;
      }

      // ── Step 2: Create Link in our Database ──
      const res = await api.post("/links/create-link", {
        postType,
        content,
        title: branding.title,
        description: branding.description,
        accentColor: branding.accentColor,
        templateKey: branding.templateKey,
        directUrl: finalFileUrl,
        directFileName: finalFileName
      });

      setGeneratedLink(res.data.linkId);
      setContent("");
      clearFile();
      setBranding((prev) => ({ ...prev, templateKey: "custom" }));
      setUploadProgress(0);

      await loadCollections();
      setActiveNav("links");
    } catch (err) {
      // If the server says the plan limit is reached, open the upgrade modal
      if (err.response?.data?.code === "PLAN_LIMIT_REACHED") {
        const { plan, used, limit } = err.response.data;
        setUsage((prev) => ({ ...prev, plan, used, limit }));
        setShowPricingModal(true);
      } else {
        alert(err.response?.data?.message || "Unable to create the feedback request.");
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const copyTextToClipboard = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      const tempInput = document.createElement("textarea");
      tempInput.value = text;
      tempInput.setAttribute("readonly", "");
      tempInput.style.position = "fixed";
      tempInput.style.opacity = "0";
      document.body.appendChild(tempInput);
      tempInput.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(tempInput);
      return copied;
    } catch (err) {
      return false;
    }
  };

  const copyLink = async (id) => {
    const shareUrl = `${window.location.origin}/feedback/${id}`;
    const copiedSuccessfully = await copyTextToClipboard(shareUrl);
    if (copiedSuccessfully) {
      setCopied(true);
      alert("Link copied to your clipboard.");
      setTimeout(() => setCopied(false), 2500);
      return;
    }

    alert("Unable to copy the link right now. Please copy it manually.");
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this piece of feedback?")) return;
    try {
      await api.delete(`/feedback/${id}`);
      setFeedback((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete feedback");
    }
  };

  const toggleLinkStatus = async (linkId) => {
    try {
      await api.patch(`/links/${linkId}/toggle`);
      await loadCollections();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update the link status.");
    }
  };

  const deleteLink = async (linkId) => {
    const confirmed = window.confirm("Delete this link and all of its feedback?");
    if (!confirmed) return;

    try {
      await api.delete(`/links/${linkId}`);
      await loadCollections();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete the link.");
    }
  };

  const exportFeedbackCsv = () => {
    const rows = filteredFeedback.map((item) => [
      new Date(item.createdAt).toISOString(),
      item.linkId,
      links.find((link) => link.linkId === item.linkId)?.title || "",
      item.message.replaceAll('"', '""'),
    ]);

    const csv = [
      ["Created At", "Link ID", "Link Title", "Message"],
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${String(cell)}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Verit-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    }
    navigate("/");
  };

  const handleNavSelect = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
    if (id === "feedback") {
      setUnreadFeedback(false);
      localStorage.setItem("Verit.feedbackCount", feedback.length.toString());
    }
  };

  const [cmdKOpen, setCmdKOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdKOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCommandSelect = (id) => {
    if (id === "home") navigate("/");
    else if (id === "settings") setShowSettingsModal(true);
    else if (id === "plans") { setActiveNav("plans"); setShowPricingModal(true); }
    else setActiveNav(id);
  };

  const handleNewPost = () => {
    setActiveNav("create");
    setGeneratedLink(null);
    setPostType("text");
    setContent("");
    setFile(null);
    setFilePreview(null);
    setSelectedTemplate(null);
    setBranding({
      title: "",
      description: "",
      accentColor: "#97ce23",
      templateKey: "custom",
    });
    localStorage.removeItem("Verit.selectedTemplate");
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
          <span className="text-gray-400 font-sans">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
      <CommandPalette isOpen={cmdKOpen} onClose={() => setCmdKOpen(false)} onSelect={handleCommandSelect} />
      {showTermsModal && <TermsModal onAccept={handleAcceptTerms} />}
      {showSettingsModal && user && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettingsModal(false)}
          onUpdate={setUser}
          onLogout={handleLogout}
        />
      )}
      {showPricingModal && (
        <PricingModal
          user={user}
          onClose={() => setShowPricingModal(false)}
          currentPlan={usage.plan}
          used={usage.used}
          limit={usage.limit}
          onUpgradeSuccess={async (updatedUser) => {
            if (updatedUser) setUser(updatedUser);
            await loadCollections();
          }}
        />
      )}

      {/* Slim Sidebar */}
      <aside className="w-20 border-r border-white/5 bg-surface flex flex-col items-center py-6 gap-6 z-20 shrink-0 hidden md:flex glass">
        <Link to="/" className="w-11 h-11 rounded-2xl bg-brand/10 flex items-center justify-center transition-transform hover:scale-105">
          <Sparkles className="text-brand" size={20} />
        </Link>
        
        <nav className="flex flex-col gap-3 flex-1 mt-6">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button
                key={id}
                onClick={() => handleNavSelect(id)}
                title={label}
                className={`relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${
                  active ? "bg-brand text-black shadow-[0_0_15px_rgba(151,206,35,0.4)]" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={20} />
                {id === "feedback" && unreadFeedback && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-surface text-white text-[9px] font-bold flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto flex flex-col gap-4 items-center">
          <button 
            onClick={() => setShowSettingsModal(true)} 
            className="w-11 h-11 flex items-center justify-center rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Account Settings"
          >
            <Settings size={20} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowProfileCard((prev) => !prev)}
              className="w-11 h-11 rounded-full overflow-hidden border border-brand/40 bg-[#111111] hover:border-brand/70 transition-colors flex items-center justify-center"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-brand" />
              )}
            </button>
            {showProfileCard && (
              <div className="absolute bottom-14 left-14 z-50">
                <ProfileDropdown user={user} onClose={() => setShowProfileCard(false)} />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors md:hidden"
            >
              <Menu size={18} />
            </button>
            
            <button 
              onClick={() => setCmdKOpen(true)} 
              className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-surface border border-white/5 text-gray-400 text-sm hover:border-white/10 transition-colors w-72 text-left"
            >
              <Search size={16} />
              <span className="flex-1">Search or jump to...</span>
              <kbd className="bg-black/60 px-2 py-0.5 rounded text-[10px] font-sans font-bold tracking-wider text-gray-500 border border-white/5">⌘K</kbd>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
             <button
               onClick={() => setShowPricingModal(true)}
               className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 bg-surface border border-white/5 text-brand"
             >
               <Zap size={13} />
               Upgrade
               <span className="ml-1 opacity-70 font-normal">
                 {usage.used}/{usage.limit ?? "∞"}
               </span>
             </button>
            <button 
              onClick={handleNewPost} 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-black font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={16} /> <span className="hidden sm:inline">New Post</span>
            </button>
          </div>
        </header>

        {/* Announcement Banner */}
        <AnimatePresence>
          {announcement && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-2 border-b border-white/5 overflow-hidden"
              style={{
                backgroundColor: 
                  announcement.type === "warning" ? "#ef444422" : 
                  announcement.type === "success" ? "#22c55e22" : 
                  announcement.type === "brand" ? "#97ce2322" : "#ffffff11"
              }}
            >
              <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ 
                      backgroundColor: 
                        announcement.type === "warning" ? "#ef4444" : 
                        announcement.type === "success" ? "#22c55e" : 
                        announcement.type === "brand" ? "#97ce23" : "#ffffff"
                    }} 
                  />
                  <p className="text-xs font-medium text-gray-200">
                    {announcement.message}
                  </p>
                </div>
                <button onClick={() => setAnnouncement(null)} className="p-1 hover:bg-white/5 rounded-md transition-colors">
                  <X size={12} className="text-gray-500" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bento Grid */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* The Main Stage (Center) */}
            <div className="xl:col-span-3 space-y-6">
              
              <AnimatePresence mode="wait">
                {activeNav === "create" && (
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-3xl p-7 space-y-6 border border-white/5 bg-surface shadow-glow"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Templates</p>
                        <h3 className="mt-2 text-xl font-bold text-white">Start from a polished prompt</h3>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-xs font-semibold text-brand">
                        <Sparkles size={14} /> Faster setup
                      </div>
                    </div>

                    {selectedTemplate && (
                      <div className="flex flex-col gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-brand">Selected template</p>
                          <p className="mt-2 font-semibold text-white">{selectedTemplate.title}</p>
                          <p className="text-sm text-gray-400">{selectedTemplate.summary}</p>
                        </div>
                        <button
                          onClick={clearSelectedTemplate}
                          className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5"
                        >
                          Clear selection
                        </button>
                      </div>
                    )}

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {TEMPLATE_PRESETS.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="rounded-2xl border border-white/5 bg-black/20 p-4 text-left transition-all hover:-translate-y-1 hover:border-white/10 hover:bg-white/5"
                        >
                          <div
                            className="mb-4 h-10 w-10 rounded-xl"
                            style={{ background: `${template.accentColor}20`, border: `1px solid ${template.accentColor}40` }}
                          />
                          <p className="text-sm font-semibold text-white">{template.label}</p>
                          <p className="mt-2 text-xs leading-6 text-gray-500">{template.description}</p>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 relative bg-black/40 p-1.5 rounded-2xl w-fit border border-white/5">
                      {POST_TYPES.map((type) => {
                        const Icon = type.icon;
                        const active = postType === type.id;
                        return (
                          <button
                            key={type.id}
                            onClick={() => switchType(type.id)}
                            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                              active ? "text-black" : "text-gray-400 hover:text-white"
                            }`}
                          >
                            {active && (
                              <motion.div
                                layoutId="highlight"
                                className="absolute inset-0 rounded-xl bg-brand z-[-1]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                              />
                            )}
                            <Icon size={15} />
                            {type.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                      <div className="space-y-4">
                        {postType === "text" && (
                          <div className="relative">
                            <textarea
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              rows={7}
                              placeholder="Ask a question or write something you want feedback on..."
                              className="w-full p-5 rounded-2xl bg-black border border-white/10 text-white outline-none focus:border-brand/50 transition-colors resize-none placeholder:text-gray-600 text-base"
                            />
                            <div className="absolute bottom-3 right-4 text-xs text-gray-500 font-mono">
                               {content.length > 0 ? `${content.length} chars` : "Ready"}
                            </div>
                          </div>
                        )}

                        {postType === "url" && (
                          <div className="flex items-center gap-3 bg-black border border-white/10 rounded-2xl px-5 py-4 focus-within:border-brand/50 transition-colors">
                            <Globe size={20} className="text-gray-500 shrink-0" />
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
                                  accept={postType === "image" ? "image/*" : "video/*"}
                                  onChange={handleFileChange}
                                />
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${activeType?.color}20` }}>
                                  {postType === "image" && <ImageIcon size={28} style={{ color: activeType?.color }} />}
                                  {postType === "video" && <Film size={28} style={{ color: activeType?.color }} />}
                                </div>
                                <p className="font-semibold text-gray-300">
                                  Click to upload {postType === "image" ? "an image" : "a video"}
                                </p>
                              </label>
                            ) : (
                              <div className="rounded-2xl border border-white/10 bg-black p-4 flex items-start gap-4">
                                {postType === "image" && filePreview && <img src={filePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl" />}
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

                            <div className="relative">
                               <textarea
                                 value={content}
                                 onChange={(e) => setContent(e.target.value)}
                                 rows={3}
                                 placeholder="Add a caption or question (optional)..."
                                 className="w-full p-4 rounded-2xl bg-black border border-white/10 text-white outline-none focus:border-white/20 resize-none placeholder:text-gray-600 text-sm"
                               />
                               <div className="absolute bottom-3 right-4 text-xs text-gray-500 font-mono">
                                 {content.length > 0 ? `${content.length} chars` : "Ready"}
                               </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 rounded-2xl border border-white/5 bg-black/40 p-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Branding</p>
                          <h4 className="mt-2 font-bold text-white text-sm">Custom link appearance</h4>
                        </div>

                        <div>
                          <input
                            value={branding.title}
                            onChange={(e) => setBranding({ ...branding, title: e.target.value })}
                            placeholder="Title (e.g. Feedback Request)"
                            className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand/50"
                          />
                        </div>

                        <div>
                          <textarea
                            value={branding.description}
                            onChange={(e) => setBranding({ ...branding, description: e.target.value })}
                            placeholder="Tell people what you want feedback on."
                            rows={3}
                            className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand/50 resize-none"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={branding.accentColor}
                              onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                              className="h-10 w-12 cursor-pointer rounded-lg border border-white/5 bg-black/60 p-0.5"
                            />
                            <div className="text-xs text-gray-400">Accent Color</div>
                          </div>
                        </div>

                        <button
                          disabled={submitting}
                          onClick={handleSubmit}
                          className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden ${
                            submitting 
                              ? "bg-white/5 text-gray-500 cursor-not-allowed" 
                              : "hover:brightness-110 active:scale-[0.98] shadow-[0_20px_40px_rgba(151,206,35,0.2)]"
                          }`}
                          style={!submitting ? { background: branding.accentColor, color: "#000" } : {}}
                        >
                          {submitting && (
                            <div 
                              className="absolute bottom-0 left-0 h-1 bg-[#97ce23] transition-all duration-300" 
                              style={{ width: `${uploadProgress}%`, background: branding.accentColor }}
                            />
                          )}
                          <div className="flex items-center gap-2">
                            {submitting ? (
                              <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>{uploadProgress > 0 ? `Uploading ${uploadProgress}%...` : "Generating..."}</span>
                              </>
                            ) : (
                              "Generate Link"
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {generatedLink && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-3 rounded-2xl border border-brand/30 bg-brand/10 p-5"
                        >
                          <div className="flex items-center gap-2 text-brand font-semibold text-sm">
                            <CheckCircle size={16} /> Link ready
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
                )}

                {/* We render the other tabs but structured as bento cards */}
                {activeNav === "analytics" && (
                  <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {[
                        { label: "Total links", value: analytics?.summary?.totalLinks ?? 0 },
                        { label: "Active links", value: analytics?.summary?.activeLinks ?? 0 },
                        { label: "Total responses", value: analytics?.summary?.totalResponses ?? feedback.length },
                        { label: "Responses this week", value: analytics?.summary?.responsesThisWeek ?? 0 },
                      ].map((item) => (
                        <div key={item.label} className="rounded-3xl border border-white/5 bg-surface p-6 shadow-glow">
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{item.label}</p>
                          <p className="mt-4 text-4xl font-extrabold text-brand">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                       {/* Keep existing analytics charts */}
                       <div className="rounded-3xl border border-white/5 bg-surface p-6">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Last 7 days</p>
                              <h3 className="mt-2 text-xl font-bold">Response trend</h3>
                            </div>
                            <BarChart3 className="text-brand" size={18} />
                          </div>
                          <div className="mt-8 grid grid-cols-7 gap-3 items-end h-56">
                            {(analytics?.dailyResponses || []).map((item) => {
                              const maxValue = Math.max(...(analytics?.dailyResponses || []).map((day) => day.value), 1);
                              const height = Math.max((item.value / maxValue) * 100, item.value ? 18 : 10);
                              return (
                                <div key={item.label} className="flex flex-col items-center gap-3">
                                  <div className="flex h-44 w-full items-end justify-center">
                                    <div className="w-full max-w-10 rounded-t-xl" style={{ height: `${height}%`, background: `linear-gradient(180deg, ${branding.accentColor}, rgba(151,206,35,0.1))` }} />
                                  </div>
                                  <span className="text-xs text-gray-500">{item.label}</span>
                                </div>
                              );
                            })}
                          </div>
                       </div>
                       <div className="rounded-3xl border border-white/5 bg-surface p-6 space-y-5">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">By post type</p>
                            <h3 className="mt-2 text-xl font-bold">Where the responses are coming from</h3>
                          </div>
                          <div className="space-y-3">
                            {POST_TYPES.map((type) => {
                              const count = analytics?.responseByType?.[type.id] || 0;
                              return (
                                <div key={type.id} className="rounded-2xl border border-white/5 bg-black/45 p-3">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${type.color}18` }}>
                                        <type.icon size={14} style={{ color: type.color }} />
                                      </div>
                                      <p className="text-sm font-semibold text-white">{type.label}</p>
                                    </div>
                                    <span className="text-lg font-bold text-brand">{count}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeNav === "links" && (
                  <motion.div key="links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    {links.length === 0 ? (
                      <div className="rounded-3xl border border-white/5 bg-surface p-12 text-center shadow-glow">
                        <LinkIcon size={48} className="mx-auto mb-4 text-gray-700" />
                        <p className="font-semibold text-gray-300">No links yet</p>
                        <p className="mt-1 text-sm text-gray-600">Create a branded feedback page to start collecting responses.</p>
                        <button onClick={() => setActiveNav("create")} className="mt-6 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-black">Create a post</button>
                      </div>
                    ) : (
                      <div className="grid gap-5 xl:grid-cols-2">
                        {links.map((link) => {
                          const linkColor = link.accentColor || "#97ce23";
                          const responseCount = link.responseCount || 0;
                          return (
                            <div key={link._id} className="rounded-3xl border border-white/5 bg-surface p-6 shadow-glow">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="rounded-lg px-2 py-1 text-[10px] font-bold text-black uppercase" style={{ background: linkColor }}>{link.postType}</span>
                                    <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-400 flex items-center gap-1">
                                      <MessageSquare size={10} /> {responseCount} responses
                                    </span>
                                    <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-400 flex items-center gap-1">
                                      <BarChart3 size={10} /> {link.views || 0} views
                                    </span>
                                  </div>
                                  <h3 className="mt-3 text-lg font-bold text-white">{link.title || link.templateKey || "Untitled link"}</h3>
                                  <p className="mt-1 text-xs leading-5 text-gray-400 line-clamp-2">{link.description || "No description."}</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl border border-white/5" style={{ background: `${linkColor}18` }} />
                              </div>
                              <div className="mt-5 rounded-2xl border border-white/5 bg-black/40 p-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Share URL</p>
                                <div className="mt-2 flex gap-2">
                                  <div className="flex-1 truncate rounded-lg border border-white/5 bg-black px-3 py-2 font-mono text-[10px] text-gray-300 flex items-center">
                                    {window.location.origin}/feedback/{link.linkId}
                                  </div>
                                  <button onClick={() => copyLink(link.linkId)} className="rounded-lg px-3 py-2 text-xs font-bold text-black" style={{ background: linkColor }}>Copy</button>
                                </div>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedLinkDetails(link);
                                    setActiveNav("link_details");
                                  }} 
                                  className="flex items-center gap-2 rounded-lg border border-brand/20 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/20"
                                >
                                  <MessageSquare size={14} /> View Details
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedShareLink(link);
                                    setIsShareModalOpen(true);
                                  }} 
                                  className="flex items-center gap-2 rounded-lg border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-xs font-semibold text-pink-300 hover:bg-pink-500/20"
                                >
                                  <Camera size={14} /> Story
                                </button>
                                <button onClick={() => toggleLinkStatus(link.linkId)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10">{link.isActive ? "Deactivate" : "Reactivate"}</button>
                                <button onClick={() => deleteLink(link.linkId)} className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20">Delete</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeNav === "link_details" && selectedLinkDetails && (
                  <motion.div key="link_details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => { setActiveNav("links"); setSelectedLinkDetails(null); }}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <ArrowLeft size={20} /> Back to Links
                      </button>
                      <h2 className="text-2xl font-bold text-white">Post Details</h2>
                    </div>

                    <div className="rounded-3xl border border-white/5 bg-surface p-6 shadow-glow">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="rounded-lg px-2 py-1 text-[10px] font-bold text-black uppercase" style={{ background: selectedLinkDetails.accentColor || "#97ce23" }}>
                          {selectedLinkDetails.postType}
                        </span>
                        <h3 className="text-xl font-bold text-white">{selectedLinkDetails.title || "Untitled link"}</h3>
                      </div>
                      
                      {selectedLinkDetails.description && (
                        <p className="text-gray-400 text-sm mb-6">{selectedLinkDetails.description}</p>
                      )}

                      <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden relative">
                        {selectedLinkDetails.postType === "text" && (
                          <div className="p-6 text-xl font-medium leading-relaxed italic text-gray-200">"{selectedLinkDetails.content}"</div>
                        )}
                        
                        {selectedLinkDetails.postType === "image" && selectedLinkDetails.directUrl && (
                          <div className="relative aspect-video max-h-[400px] w-full bg-black/50 flex items-center justify-center">
                            <img src={selectedLinkDetails.directUrl} alt="Post media" className="max-w-full max-h-[400px] object-contain" />
                            {selectedLinkDetails.content && (
                              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white text-sm">{selectedLinkDetails.content}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {selectedLinkDetails.postType === "video" && selectedLinkDetails.directUrl && (
                          <div className="relative aspect-video max-h-[400px] w-full bg-black/50">
                            <video src={selectedLinkDetails.directUrl} controls className="w-full h-full object-contain" />
                            {selectedLinkDetails.content && (
                              <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
                                <p className="text-white text-sm drop-shadow-md">{selectedLinkDetails.content}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedLinkDetails.postType === "url" && (
                          <div className="p-6 flex flex-col items-center justify-center gap-4">
                            <Globe size={48} className="text-gray-600" />
                            <a href={selectedLinkDetails.content} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                              {selectedLinkDetails.content}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Feedback for this post</h3>
                      {feedback.filter(f => f.linkId === selectedLinkDetails.linkId).length === 0 ? (
                        <div className="p-12 rounded-3xl border border-white/5 text-center bg-surface shadow-glow">
                          <MessageSquare size={36} className="mx-auto mb-4 text-gray-700" />
                          <p className="text-gray-300 font-semibold">No feedback yet</p>
                          <p className="text-gray-600 text-sm mt-1">Share your link to get responses on this post.</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {feedback.filter(f => f.linkId === selectedLinkDetails.linkId).map((message) => {
                            const isRevealed = revealedMessages.includes(message._id);
                            const showBlur = message.isToxic && !isRevealed;

                            return (
                              <div key={message._id} className="rounded-2xl md:rounded-3xl p-5 md:p-6 relative overflow-hidden border border-white/5 bg-surface shadow-glow hover:-translate-y-1 transition-transform flex flex-col">
                                <div className={`absolute top-0 left-0 w-1 h-full ${message.isToxic ? 'bg-red-500' : 'bg-brand'} rounded-l-3xl`} />
                                
                                <div className="flex-1 relative">
                                  {showBlur && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-xl border border-red-500/20">
                                      <span className="text-xl mb-2">⚠️</span>
                                      <p className="text-xs text-red-400 font-bold tracking-wider uppercase mb-3">Toxic Content Hidden</p>
                                      <button 
                                        onClick={() => setRevealedMessages(prev => [...prev, message._id])}
                                        className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition-colors"
                                      >
                                        Reveal Message
                                      </button>
                                    </div>
                                  )}
                                  <p className={`text-gray-200 text-sm leading-relaxed pl-2 ${showBlur ? 'opacity-20 blur-[2px] select-none' : ''}`}>
                                    {message.message}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between gap-3 mt-5 pl-2">
                                  <button 
                                    onClick={() => deleteFeedback(message._id)}
                                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                  <span className="text-[10px] text-gray-600">{new Date(message.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeNav === "feedback" && (
                  <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    {feedback.length === 0 ? (
                      <div className="p-16 rounded-3xl border border-white/5 text-center bg-surface shadow-glow">
                        <MessageSquare size={48} className="mx-auto mb-4 text-gray-700" />
                        <p className="text-gray-300 font-semibold">No messages yet</p>
                        <p className="text-gray-600 text-sm mt-1">Share your link to start collecting honest feedback.</p>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-3xl border border-white/5 bg-surface p-5 space-y-4">
                           <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                             <input value={feedbackSearch} onChange={(e) => setFeedbackSearch(e.target.value)} placeholder="Search feedback text..." className="rounded-xl border border-white/5 bg-black/50 px-4 py-2 text-sm text-white outline-none focus:border-brand/50" />
                             <select value={feedbackRange} onChange={(e) => setFeedbackRange(e.target.value)} className="rounded-xl border border-white/5 bg-black/50 px-4 py-2 text-sm text-white outline-none">
                               <option value="all">All time</option>
                               <option value="7d">Last 7 days</option>
                               <option value="30d">Last 30 days</option>
                             </select>
                             <button onClick={exportFeedbackCsv} className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Export CSV</button>
                           </div>
                        </div>
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {filteredFeedback.map((message) => {
                            const linkTitle = links.find((link) => link.linkId === message.linkId)?.title || message.linkId;
                            const isRevealed = revealedMessages.includes(message._id);
                            const showBlur = message.isToxic && !isRevealed;

                            return (
                              <div key={message._id} className="rounded-2xl md:rounded-3xl p-5 md:p-6 relative overflow-hidden border border-white/5 bg-surface shadow-glow hover:-translate-y-1 transition-transform flex flex-col">
                                <div className={`absolute top-0 left-0 w-1 h-full ${message.isToxic ? 'bg-red-500' : 'bg-brand'} rounded-l-3xl`} />
                                
                                <div className="flex-1 relative">
                                  {showBlur && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-xl border border-red-500/20">
                                      <span className="text-xl mb-2">⚠️</span>
                                      <p className="text-xs text-red-400 font-bold tracking-wider uppercase mb-3">Toxic Content Hidden</p>
                                      <button 
                                        onClick={() => setRevealedMessages(prev => [...prev, message._id])}
                                        className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition-colors"
                                      >
                                        Reveal Message
                                      </button>
                                    </div>
                                  )}
                                  <p className={`text-gray-200 text-sm leading-relaxed pl-2 ${showBlur ? 'opacity-20 blur-[2px] select-none' : ''}`}>
                                    {message.message}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between gap-3 mt-5 pl-2">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-gray-500">{linkTitle}</span>
                                    <button 
                                      onClick={() => deleteFeedback(message._id)}
                                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-gray-600">{new Date(message.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeNav === "trash" && (
                  <motion.div key="trash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Trash</h2>
                        <p className="text-sm text-gray-500 mt-1">Deleted links still count toward your plan limit.</p>
                      </div>
                    </div>

                    {loadingDeleted ? (
                      <div className="p-16 rounded-3xl border border-white/5 text-center bg-surface flex flex-col items-center gap-4 shadow-glow">
                        <Loader2 className="animate-spin text-brand" size={32} />
                        <p className="text-gray-400">Loading your trash...</p>
                      </div>
                    ) : deletedLinks.length === 0 ? (
                      <div className="p-16 rounded-3xl border border-white/5 text-center bg-surface shadow-glow">
                        <Archive size={48} className="mx-auto mb-4 text-gray-700" />
                        <p className="text-gray-300 font-semibold">Your trash is empty</p>
                        <p className="text-gray-600 text-sm mt-1">Links you delete will appear here.</p>
                      </div>
                    ) : (
                      <div className="grid gap-5 xl:grid-cols-2">
                        {deletedLinks.map((link) => (
                          <div key={link._id} className="rounded-3xl border border-white/5 bg-surface p-6 shadow-glow opacity-60">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="rounded-lg px-2 py-1 text-[10px] font-bold text-white uppercase bg-gray-700">{link.postType}</span>
                                  <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-400">
                                    Deleted {new Date(link.deletedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-white/50 line-through">{link.title || link.templateKey || "Untitled link"}</h3>
                              </div>
                              <Archive className="text-gray-600" size={20} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeNav === "plans" && (
                   <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="rounded-3xl border border-white/5 bg-surface p-7 shadow-glow flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                            <Zap size={24} className="text-brand" />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Current Plan</p>
                            <p className="text-xl font-bold text-white mt-1">{usage.plan.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${usage.percentage ?? 0}%` }} className="h-full rounded-full bg-brand" />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-2">{usage.used} / {usage.limit ?? "∞"} links used</p>
                        </div>
                      </div>
                      
                      <div className="grid gap-5 md:grid-cols-3">
                         {/* Plan cards here, just keeping it simple for the layout rebuild */}
                         {["free", "pro", "ultra"].map(planId => (
                            <div key={planId} className="rounded-3xl border border-white/5 bg-surface p-6">
                               <p className="text-lg font-bold text-white capitalize">{planId}</p>
                               <button onClick={() => setShowPricingModal(true)} className="w-full mt-4 py-2 rounded-xl bg-white/5 text-white text-sm font-semibold hover:bg-brand hover:text-black transition-colors">View details</button>
                            </div>
                         ))}
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* The Insights Grid (Right side) */}
            <div className="xl:col-span-1 space-y-6 hidden xl:block">
              <div className="rounded-3xl border border-white/5 bg-surface p-6 shadow-glow">
                <h3 className="text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-[0.2em]">Insights Overview</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Total Feedback</p>
                    <p className="text-xl font-bold text-white">{analytics?.summary?.totalResponses ?? feedback.length}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Active Links</p>
                    <p className="text-xl font-bold text-white">{analytics?.summary?.activeLinks ?? 0}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-between">
                    <p className="text-xs text-brand">Responses (7d)</p>
                    <p className="text-xl font-bold text-brand">{analytics?.summary?.responsesThisWeek ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/5 bg-surface p-6 shadow-glow">
                <h3 className="text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-[0.2em]">Pro Tip</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Use <kbd className="bg-white/10 px-1 py-0.5 rounded text-[10px] font-mono text-gray-300">Cmd+K</kbd> to quickly jump between views, create new links, or access your account settings from anywhere.
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Mobile navigation bar */}
      <nav className="fixed bottom-0 inset-x-0 h-16 border-t border-white/10 bg-black/90 backdrop-blur-xl flex items-center justify-around z-40 md:hidden">
        {NAV.slice(0, 4).map(({ id, icon: Icon }) => (
          <button key={id} onClick={() => handleNavSelect(id)} className={`p-3 rounded-xl transition-colors ${activeNav === id ? "text-brand bg-brand/10" : "text-gray-500"}`}>
             <Icon size={20} />
          </button>
        ))}
      </nav>

      <StoryShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        link={selectedShareLink} 
        username={user?.username || "user"} 
      />
    </div>
  );
}
