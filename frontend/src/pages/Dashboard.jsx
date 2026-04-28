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
  Home,
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
import darkCloudBg from "../assets/dark_cloud_bg.png";

const isLocal = window.location.hostname === "localhost";
const BACKEND_URL = isLocal ? "http://localhost:5000" : "https://truthbox-production.up.railway.app";

const POST_TYPES = [
  { id: "text", label: "Text", icon: FileText, color: "#38BDF8", desc: "Publish a written prompt for structured feedback" },
  { id: "image", label: "Image", icon: ImageIcon, color: "#60a5fa", desc: "Share a visual asset for review and comments" },
  { id: "video", label: "Video", icon: Film, color: "#a78bfa", desc: "Share a video clip and collect responses" },
  { id: "pdf", label: "PDF", icon: FileUp, color: "#f87171", desc: "Upload a PDF document for review" },
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
    accentColor: "#3B82F6",
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
    accentColor: "#38BDF8",
    templateKey: "custom",
  });
  // ── Plan / usage state
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [usage, setUsage] = useState({ plan: "free", used: 0, limit: 5, percentage: 0 });
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [hasMoreFeedback, setHasMoreFeedback] = useState(false);
  const [loadingMoreFeedback, setLoadingMoreFeedback] = useState(false);
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
      api.get("/feedback/my-feedback?page=1&limit=20"),
      api.get("/links/my-links"),
      api.get("/links/analytics"),
      api.get("/links/usage"),
      api.get("/system/announcement").catch(() => ({ data: null })),
    ]);
    const previousCount = parseInt(localStorage.getItem("Verit.feedbackCount") || "0");
    if (fbRes.data.total > previousCount) {
      setUnreadFeedback(true);
    }
    setFeedback(fbRes.data.feedback);
    setHasMoreFeedback(fbRes.data.hasMore);
    setFeedbackPage(1);
    setLinks(linksRes.data);
    setAnalytics(analyticsRes.data);
    setUsage(usageRes.data);
    setAnnouncement(announceRes?.data);
  };

  const loadMoreFeedback = async () => {
    if (loadingMoreFeedback || !hasMoreFeedback) return;
    setLoadingMoreFeedback(true);
    try {
      const nextPage = feedbackPage + 1;
      const res = await api.get(`/feedback/my-feedback?page=${nextPage}&limit=20`);
      setFeedback((prev) => [...prev, ...res.data.feedback]);
      setFeedbackPage(nextPage);
      setHasMoreFeedback(res.data.hasMore);
    } catch (err) {
      console.error("Error loading more feedback:", err);
    } finally {
      setLoadingMoreFeedback(false);
    }
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
        accentColor: template.accent || "#3B82F6",
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
      accentColor: "#3B82F6",
      templateKey: "custom",
    });
  };

  const handleSubmit = async () => {
    if (postType === "text" && !content.trim()) return alert("Please enter the prompt you want reviewed.");
    if (postType === "url" && !content.trim()) return alert("Please enter the URL you want reviewed.");
    if (["image", "video", "pdf"].includes(postType) && !file) return alert("Please select a file before continuing.");

    setSubmitting(true);
    try {
      let finalFileUrl = "";
      let finalFileName = "";

      // ── Step 1: Direct Upload to Cloudinary (if file exists) ──
      if (file && ["image", "video", "pdf"].includes(postType)) {
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
      accentColor: "#3B82F6",
      templateKey: "custom",
    });
    localStorage.removeItem("Verit.selectedTemplate");
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
          <span className="text-[#94A3B8] font-sans">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#E2E8F0] font-sans flex overflow-hidden relative">
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{ 
          backgroundImage: `url(${darkCloudBg})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 1 
        }} 
      />
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

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#1E293B] border-r border-[#334155] flex flex-col py-6 px-4 gap-6 z-50 md:hidden shadow-2xl"
            >
              <div className="px-2 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group transition-opacity hover:opacity-80">
                  <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="text-[#3B82F6]" size={16} />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-[#E2E8F0]">Verit</span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-[#94A3B8] hover:bg-[#0F172A] rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              
               
              <nav className="flex flex-col gap-1 flex-1 mt-2 overflow-y-auto">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-sm text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#0F172A] border border-dashed border-[#334155]/30 mb-2"
                >
                  <ArrowLeft size={18} />
                  <span>Back to Website</span>
                </Link>
                {NAV.map(({ id, label, icon: Icon }) => {
                  const active = activeNav === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        handleNavSelect(id);
                        setSidebarOpen(false);
                      }}
                      className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-sm ${
                        active ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#0F172A]"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                      {id === "feedback" && unreadFeedback && (
                        <span className="absolute right-3 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </button>
                  );
                })}
              </nav>
              
              <div className="mt-auto flex flex-col gap-2 border-t border-[#334155] pt-4">
                <button 
                  onClick={() => { setShowSettingsModal(true); setSidebarOpen(false); }} 
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#0F172A] transition-colors font-medium text-sm"
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:bg-[#0F172A] hover:border-[#334155] transition-colors text-left mt-2"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#334155] bg-[#0F172A] flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-[#94A3B8]" size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#E2E8F0] truncate">{user?.username || "Guest"}</p>
                    <p className="text-xs text-[#94A3B8] truncate">Sign out</p>
                  </div>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Expanded Sidebar */}
      <aside className="w-64 border-r border-[#334155] bg-[#1E293B] flex flex-col py-6 px-4 gap-6 z-20 shrink-0 hidden md:flex">
        <Link to="/" className="px-2 flex items-center gap-3 group transition-opacity hover:opacity-80">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="text-[#3B82F6]" size={16} />
          </div>
          <span className="font-bold text-lg tracking-tight text-[#E2E8F0]">Verit</span>
        </Link>
        
        
        <nav className="flex flex-col gap-1 flex-1 mt-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#0F172A] border border-dashed border-[#334155]/30 mb-2"
          >
            <ArrowLeft size={18} />
            <span>Back to Website</span>
          </Link>
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button
                key={id}
                onClick={() => handleNavSelect(id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                  active ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#0F172A]"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {id === "feedback" && unreadFeedback && (
                  <span className="absolute right-3 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto flex flex-col gap-2 border-t border-[#334155] pt-4">
          <button 
            onClick={() => setShowSettingsModal(true)} 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#0F172A] transition-colors font-medium text-sm"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          
          <div className="relative mt-2">
            <button
              onClick={() => setShowProfileCard((prev) => !prev)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent hover:bg-[#0F172A] hover:border-[#334155] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#334155] bg-[#0F172A] flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={14} className="text-[#94A3B8]" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate text-[#E2E8F0]">{user?.username || "User"}</p>
                <p className="text-xs text-[#94A3B8] truncate">{user?.email || "Account"}</p>
              </div>
            </button>
            {showProfileCard && (
              <div className="absolute bottom-12 left-0 w-full z-50">
                <ProfileDropdown user={user} onClose={() => setShowProfileCard(false)} />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-[#334155] bg-[#1E293B] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl border border-[#334155] bg-[#0F172A] hover:bg-[#334155] flex items-center justify-center transition-colors md:hidden text-[#E2E8F0]"
            >
              <Menu size={18} />
            </button>

            <Link to="/" className="md:hidden flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Sparkles className="text-[#3B82F6]" size={16} />
              </div>
              <span className="font-bold text-base tracking-tight text-[#E2E8F0]">Verit</span>
            </Link>
            
            <button 
              onClick={() => setCmdKOpen(true)} 
              className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-[#0F172A] border border-[#334155] text-[#94A3B8] text-sm hover:border-[#475569] transition-colors w-72 text-left shadow-sm"
            >
              <Search size={16} />
              <span className="flex-1">Search or jump to...</span>
              <kbd className="bg-[#1E293B] px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#94A3B8] border border-[#334155] shadow-sm">⌘K</kbd>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
             <button
               onClick={() => setShowPricingModal(true)}
               className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-[#0F172A] bg-[#1E293B] border border-[#334155] text-[#E2E8F0] shadow-sm"
             >
               <Zap size={13} className="text-[#3B82F6]" />
               Upgrade
               <span className="ml-1 text-[#94A3B8] font-normal">
                 {usage.used}/{usage.limit ?? "∞"}
               </span>
             </button>
            <button 
              onClick={handleNewPost} 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-[#2563EB] transition-colors shadow-sm"
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
              className="px-6 py-2 border-b border-[#334155] overflow-hidden"
              style={{
                backgroundColor: 
                  announcement.type === "warning" ? "#ef444422" : 
                  announcement.type === "success" ? "#22c55e22" : 
                  announcement.type === "brand" ? "#3B82F622" : "#ffffff11"
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
                        announcement.type === "brand" ? "#3B82F6" : "#ffffff"
                    }} 
                  />
                  <p className="text-xs font-medium text-[#E2E8F0]">
                    {announcement.message}
                  </p>
                </div>
                <button onClick={() => setAnnouncement(null)} className="p-1 hover:bg-[#1E293B]/5 rounded-md transition-colors">
                  <X size={12} className="text-[#94A3B8]" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bento Grid */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6 lg:p-8 lg:pb-8 scroll-smooth">
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
                    className="space-y-6"
                  >
                    <div className="mb-4 md:mb-6">
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#E2E8F0]">Dashboard</h1>
                      <p className="text-xs md:text-sm text-[#94A3B8] mt-1">Create and manage anonymous feedback links</p>
                    </div>

                    <div className="rounded-2xl border border-[#334155] bg-[#1E293B] shadow-sm p-4 md:p-6 space-y-4 md:space-y-6">
                      <div className="flex flex-wrap gap-2">
                        {POST_TYPES.map((type) => {
                          const Icon = type.icon;
                          const active = postType === type.id;
                          return (
                            <button
                              key={type.id}
                              onClick={() => switchType(type.id)}
                              className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-colors ${
                                active ? "bg-[#0F172A] text-[#E2E8F0] border border-[#334155]" : "text-[#94A3B8] hover:bg-[#0F172A] border border-transparent"
                              }`}
                            >
                              <Icon size={12} className="md:w-[14px] md:h-[14px]" />
                              {type.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-4">
                        {postType === "text" && (
                          <div className="relative">
                            <textarea
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              rows={window.innerWidth < 768 ? 3 : 5}
                              placeholder="Ask a question or write something you want feedback on..."
                              className="w-full p-3 md:p-4 rounded-xl bg-[#0F172A] border border-[#334155] text-[#E2E8F0] outline-none focus:border-[#3B82F6] transition-colors resize-none placeholder:text-[#64748B] text-sm md:text-base"
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-[#64748B] font-mono">
                               {content.length > 0 ? `${content.length} chars` : "Ready"}
                            </div>
                          </div>
                        )}

                        {postType === "url" && (
                          <div className="flex items-center gap-3 bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 focus-within:border-[#3B82F6] transition-colors">
                            <Globe size={20} className="text-[#64748B] shrink-0" />
                            <input
                              type="url"
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              placeholder="https://your-website.com"
                              className="bg-transparent flex-1 focus:outline-none text-[#E2E8F0] placeholder:text-[#64748B] text-base"
                            />
                          </div>
                        )}

                        {["image", "pdf", "video"].includes(postType) && (
                          <div className="space-y-4">
                            {!file ? (
                              <label
                                className="relative flex flex-col items-center justify-center gap-2 md:gap-3 border border-dashed border-[#475569] bg-[#0F172A] rounded-xl p-6 md:p-8 cursor-pointer transition-all hover:bg-[#1E293B] hover:border-[#64748B]"
                              >
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  accept={postType === "image" ? "image/*" : postType === "video" ? "video/*" : ".pdf"}
                                  onChange={handleFileChange}
                                />
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1E293B] border border-[#334155] shadow-sm">
                                  {postType === "image" && <ImageIcon size={20} className="text-[#94A3B8]" />}
                                  {postType === "video" && <Film size={20} className="text-[#94A3B8]" />}
                                  {postType === "pdf" && <FileUp size={20} className="text-[#94A3B8]" />}
                                </div>
                                <p className="font-medium text-[#94A3B8] text-sm">
                                  Click to upload {postType === "image" ? "an image" : postType === "video" ? "a video" : "a PDF"}
                                </p>
                              </label>
                            ) : (
                              <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-4 flex items-start gap-4 shadow-sm">
                                {postType === "image" && filePreview && <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />}
                                {postType === "video" && <div className="w-16 h-16 bg-[#0F172A] border border-[#334155] rounded-lg flex items-center justify-center"><Film size={24} className="text-[#94A3B8]" /></div>}
                                {postType === "pdf" && <div className="w-16 h-16 bg-[#0F172A] border border-[#334155] rounded-lg flex items-center justify-center"><FileText size={24} className="text-[#94A3B8]" /></div>}
                                <div className="flex-1 min-w-0 pt-1">
                                  <p className="font-semibold text-[#E2E8F0] text-sm truncate">{file.name}</p>
                                  <p className="text-xs text-[#94A3B8] mt-1">{(file.size / 1048576).toFixed(2)} MB</p>
                                </div>
                                <button onClick={clearFile} className="p-2 rounded-lg hover:bg-[#0F172A] text-[#94A3B8] hover:text-red-500 transition-colors">
                                  <X size={16} />
                                </button>
                              </div>
                            )}

                            <div className="relative">
                               <textarea
                                 value={content}
                                 onChange={(e) => setContent(e.target.value)}
                                 rows={2}
                                 placeholder="Add a caption or question (optional)..."
                                 className="w-full p-4 rounded-xl bg-[#0F172A] border border-[#334155] text-[#E2E8F0] outline-none focus:border-[#3B82F6] resize-none placeholder:text-[#64748B] text-sm"
                               />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          disabled={submitting}
                          onClick={handleSubmit}
                          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 ${
                            submitting 
                              ? "bg-[#334155] text-[#64748B] cursor-not-allowed" 
                              : "bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-md"
                          }`}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              <span>{uploadProgress > 0 ? `Uploading ${uploadProgress}%...` : "Generating..."}</span>
                            </>
                          ) : (
                            <>
                              Generate Link
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#334155] bg-[#1E293B] shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#E2E8F0]">Templates</h3>
                        {selectedTemplate && (
                          <button onClick={clearSelectedTemplate} className="text-xs font-semibold text-[#94A3B8] hover:text-[#E2E8F0]">
                            Clear selection
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 lg:grid-cols-2">
                        {TEMPLATE_PRESETS.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => applyTemplate(template)}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                              selectedTemplate?.id === template.id ? "border-[#3B82F6] bg-[#3B82F6]/5" : "border-[#334155] bg-[#1E293B] hover:border-[#475569] hover:bg-[#0F172A]"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${template.accentColor}15` }}>
                               <Sparkles size={14} style={{ color: template.accentColor }} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#E2E8F0]">{template.label}</p>
                              <p className="text-xs text-[#94A3B8] mt-0.5 leading-snug">{template.description}</p>
                            </div>
                          </button>
                        ))}
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
                            <div className="flex-1 truncate rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-3 font-mono text-xs text-[#E2E8F0]">
                              {window.location.origin}/feedback/{generatedLink}
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => copyLink(generatedLink)}
                              className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-white text-sm transition-colors"
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
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold tracking-tight text-[#E2E8F0]">Analytics</h2>
                      <p className="text-[#94A3B8] mt-1">Monitor your feedback performance</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {[
                        { label: "Total links", value: analytics?.summary?.totalLinks ?? 0 },
                        { label: "Active links", value: analytics?.summary?.activeLinks ?? 0 },
                        { label: "Total responses", value: analytics?.summary?.totalResponses ?? feedback.length },
                        { label: "Responses this week", value: analytics?.summary?.responsesThisWeek ?? 0 },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-[#334155] bg-[#1E293B] p-4 md:p-6 shadow-sm">
                          <p className="text-[10px] md:text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">{item.label}</p>
                          <p className="mt-2 md:mt-3 text-2xl md:text-3xl font-bold text-[#E2E8F0]">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-4 md:p-6 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="text-base font-bold text-[#E2E8F0]">Response trend</h3>
                              <p className="text-sm text-[#94A3B8]">Last 7 days</p>
                            </div>
                            <BarChart3 className="text-[#3B82F6]" size={20} />
                          </div>
                          <div className="mt-8 grid grid-cols-7 gap-3 items-end h-56">
                            {(analytics?.dailyResponses || []).map((item) => {
                              const maxValue = Math.max(...(analytics?.dailyResponses || []).map((day) => day.value), 1);
                              const height = Math.max((item.value / maxValue) * 100, item.value ? 18 : 10);
                              return (
                                <div key={item.label} className="flex flex-col items-center gap-3">
                                  <div className="flex h-44 w-full items-end justify-center">
                                    <div className="w-full max-w-10 rounded-t-lg bg-[#3B82F6]" style={{ height: `${height}%`, opacity: item.value ? 1 : 0.2 }} />
                                  </div>
                                  <span className="text-xs font-medium text-[#94A3B8]">{item.label}</span>
                                </div>
                              );
                            })}
                          </div>
                       </div>
                        <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-4 md:p-6 space-y-4 md:space-y-5 shadow-sm">
                          <div>
                            <h3 className="text-base font-bold text-[#E2E8F0]">Post types</h3>
                            <p className="text-sm text-[#94A3B8]">Where the responses are coming from</p>
                          </div>
                          <div className="space-y-3">
                            {POST_TYPES.map((type) => {
                              const count = analytics?.responseByType?.[type.id] || 0;
                              return (
                                 <div key={type.id} className="rounded-xl border border-[#334155] bg-[#0F172A] p-3 md:p-4">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-[#334155] bg-[#1E293B]">
                                        <type.icon size={14} className="text-[#94A3B8]" />
                                      </div>
                                      <p className="text-sm font-semibold text-[#E2E8F0]">{type.label}</p>
                                    </div>
                                    <span className="text-base font-bold text-[#E2E8F0]">{count}</span>
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
                  <motion.div key="links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {links.length === 0 ? (
                      <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-12 text-center shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-[#0F172A] border border-[#334155] flex items-center justify-center mx-auto mb-6">
                          <LinkIcon size={32} className="text-[#94A3B8]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#E2E8F0] mb-2">
                          No links created yet
                        </h2>
                        <p className="text-[#94A3B8] max-w-md mx-auto mb-8">
                          Create your first feedback link to start collecting anonymous responses from your audience.
                        </p>
                        <button 
                          onClick={() => setActiveNav("create")}
                          className="px-6 py-2.5 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-[#2563EB] transition-all shadow-sm"
                        >
                          Create Link
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-5 xl:grid-cols-2">
                        {links.map((link) => {
                          const linkColor = "#3B82F6";
                          const responseCount = link.responseCount || 0;
                          return (
                            <div key={link._id} className="rounded-2xl border border-[#334155] bg-[#1E293B] p-4 md:p-6 shadow-sm flex flex-col justify-between transition-all hover:border-[#475569]">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="rounded-md px-2 py-1 text-[10px] font-bold text-white uppercase" style={{ background: linkColor }}>{link.postType}</span>
                                    <span className="rounded-md border border-[#334155] bg-[#0F172A] px-2 py-1 text-[10px] text-[#94A3B8] flex items-center gap-1">
                                      <MessageSquare size={10} /> {responseCount} responses
                                    </span>
                                    <span className="rounded-md border border-[#334155] bg-[#0F172A] px-2 py-1 text-[10px] text-[#94A3B8] flex items-center gap-1">
                                      <BarChart3 size={10} /> {link.views || 0} views
                                    </span>
                                  </div>
                                   <h3 className="mt-2 text-base md:text-lg font-bold text-[#E2E8F0] line-clamp-1">{link.title || link.templateKey || "Untitled link"}</h3>
                                  <p className="mt-1 text-xs md:text-sm text-[#94A3B8] line-clamp-1 md:line-clamp-2">{link.description || "No description."}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${linkColor}15` }}>
                                  <LinkIcon size={20} style={{ color: linkColor }} />
                                </div>
                              </div>
                              <div className="mt-3 md:mt-5 rounded-xl border border-[#334155] bg-[#0F172A] p-2.5 md:p-3">
                                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Share URL</p>
                                <div className="mt-1.5 flex gap-1.5 md:gap-2">
                                  <div className="flex-1 truncate rounded-lg border border-[#334155] bg-[#1E293B] px-2 py-1.5 md:px-3 md:py-2 font-mono text-[10px] md:text-xs text-[#94A3B8] flex items-center">
                                    {window.location.origin}/feedback/{link.linkId}
                                  </div>
                                  <button onClick={() => copyLink(link.linkId)} className="rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 text-[10px] md:text-xs font-bold text-white transition-opacity hover:opacity-90" style={{ background: linkColor }}>Copy</button>
                                </div>
                              </div>
                              <div className="mt-3 md:mt-4 flex flex-wrap gap-1.5 md:gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedLinkDetails(link);
                                    setActiveNav("link_details");
                                  }} 
                                  className="flex items-center gap-1.5 rounded-lg border border-[#334155] bg-[#1E293B] px-2.5 py-1.5 md:px-3 md:py-1.5 text-[10px] md:text-xs font-semibold text-[#E2E8F0] hover:bg-[#0F172A] transition-colors"
                                >
                                  <MessageSquare size={12} className="text-[#94A3B8]" /> Details
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedShareLink(link);
                                    setIsShareModalOpen(true);
                                  }} 
                                  className="flex items-center gap-1.5 rounded-lg border border-[#334155] bg-[#1E293B] px-2.5 py-1.5 md:px-3 md:py-1.5 text-[10px] md:text-xs font-semibold text-[#E2E8F0] hover:bg-[#0F172A] transition-colors"
                                >
                                  <Camera size={12} className="text-[#94A3B8]" /> Story
                                </button>
                                <button onClick={() => toggleLinkStatus(link.linkId)} className="rounded-lg border border-[#334155] bg-[#1E293B] px-2.5 py-1.5 md:px-3 md:py-1.5 text-[10px] md:text-xs font-semibold text-[#E2E8F0] hover:bg-[#0F172A] transition-colors">{link.isActive ? "Deactivate" : "Activate"}</button>
                                <button onClick={() => deleteLink(link.linkId)} className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 md:px-3 md:py-1.5 text-[10px] md:text-xs font-semibold text-red-500 hover:bg-red-500/20 transition-colors">Delete</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeNav === "link_details" && selectedLinkDetails && (
                  <motion.div key="link_details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="mb-2">
                      <button 
                        onClick={() => { setActiveNav("links"); setSelectedLinkDetails(null); }}
                        className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors text-sm font-semibold"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                    </div>

                    <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-6 sm:p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-[#E2E8F0] tracking-tight">{selectedLinkDetails.title || "Untitled link"}</h3>
                        <span className="rounded-md px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest" style={{ background: "#3B82F6" }}>
                          {selectedLinkDetails.postType}
                        </span>
                      </div>
                      
                      {selectedLinkDetails.description && (
                        <p className="text-[#94A3B8] text-sm mb-6 border-l-2 pl-3" style={{ borderColor: "#3B82F6" }}>{selectedLinkDetails.description}</p>
                      )}

                      <div className="rounded-2xl border border-[#334155] bg-[#0F172A] overflow-hidden relative">
                        {selectedLinkDetails.postType === "text" && (
                          <div className="p-8 text-xl font-medium leading-relaxed italic text-[#94A3B8]">"{selectedLinkDetails.content}"</div>
                        )}
                        
                        {selectedLinkDetails.postType === "image" && selectedLinkDetails.fileUrl && (
                          <div className="relative aspect-video max-h-[500px] w-full bg-[#334155] flex items-center justify-center group">
                            <img src={selectedLinkDetails.fileUrl.startsWith('http') ? selectedLinkDetails.fileUrl : `${BACKEND_URL}${selectedLinkDetails.fileUrl}`} alt="Post media" className="max-w-full max-h-[500px] object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
                            {selectedLinkDetails.content && (
                              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/50 to-transparent">
                                <p className="text-white text-base font-medium">{selectedLinkDetails.content}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {selectedLinkDetails.postType === "video" && selectedLinkDetails.fileUrl && (
                          <div className="relative aspect-video max-h-[500px] w-full bg-[#334155]">
                            <video src={selectedLinkDetails.fileUrl.startsWith('http') ? selectedLinkDetails.fileUrl : `${BACKEND_URL}${selectedLinkDetails.fileUrl}`} controls className="w-full h-full object-contain" />
                            {selectedLinkDetails.content && (
                              <div className="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-[#0F172A]/90 via-[#0F172A]/50 to-transparent">
                                <p className="text-white text-base font-medium drop-shadow-lg">{selectedLinkDetails.content}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedLinkDetails.postType === "url" && (
                          <div className="p-10 flex flex-col items-center justify-center gap-6">
                            <div className="p-4 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6]">
                              <Globe size={48} />
                            </div>
                            <a href={selectedLinkDetails.content} target="_blank" rel="noreferrer" className="text-xl font-bold text-[#E2E8F0] hover:text-[#3B82F6] transition-colors text-center break-all underline decoration-[#3B82F6]/30 underline-offset-8">
                              {selectedLinkDetails.content}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6">
                      <div className="flex items-center gap-3 mb-6">
                        <MessageSquare size={20} className="text-[#3B82F6]" />
                        <h3 className="text-xl font-bold text-[#E2E8F0]">Responses on this post</h3>
                      </div>
                      
                      {feedback.filter(f => f.linkId === selectedLinkDetails.linkId).length === 0 ? (
                        <div className="p-12 rounded-2xl border border-[#334155] bg-[#1E293B] text-center shadow-sm">
                          <MessageSquare size={48} className="mx-auto mb-5 text-[#64748B]" />
                          <p className="text-[#E2E8F0] font-bold text-lg">No responses yet</p>
                          <p className="text-[#94A3B8] text-sm mt-2">Share this specific link to get anonymous thoughts.</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {feedback.filter(f => f.linkId === selectedLinkDetails.linkId).map((message) => {
                            const isRevealed = revealedMessages.includes(message._id);
                            const showBlur = message.isToxic && !isRevealed;

                            return (
                              <div key={message._id} className="group rounded-2xl p-6 relative overflow-hidden border border-[#334155] bg-[#1E293B] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                <div className={`absolute top-0 left-0 w-1 h-full ${message.isToxic ? 'bg-red-500' : 'bg-[#3B82F6]'} transition-all duration-500`} />
                                <div className="absolute -top-6 -right-6 text-[#0F172A] transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                                  <MessageSquare size={100} />
                                </div>
                                
                                <div className="flex-1 relative z-10 pt-2">
                                  {showBlur && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1E293B]/80 backdrop-blur-md rounded-xl border border-red-100">
                                      <span className="text-3xl mb-3">⚠️</span>
                                      <p className="text-xs text-red-600 font-bold tracking-widest uppercase mb-4">Toxic Hidden</p>
                                      <button 
                                        onClick={() => setRevealedMessages(prev => [...prev, message._id])}
                                        className="px-5 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 hover:bg-red-100 transition-colors"
                                      >
                                        Reveal Response
                                      </button>
                                    </div>
                                  )}
                                  <p className={`text-[#E2E8F0] text-sm font-medium leading-relaxed pl-3 ${showBlur ? 'opacity-20 blur-[4px] select-none' : ''}`}>
                                    "{message.message}"
                                  </p>
                                </div>

                                <div className="flex items-center justify-between gap-3 mt-8 pl-3 relative z-10 border-t border-[#334155] pt-4">
                                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#64748B]">{new Date(message.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <button 
                                    onClick={() => deleteFeedback(message._id)}
                                    className="p-2 rounded-lg text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
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
                      <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-12 text-center shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-[#0F172A] border border-[#334155] flex items-center justify-center mx-auto mb-6">
                          <MessageSquare size={32} className="text-[#94A3B8]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#E2E8F0] mb-2">No messages yet</h2>
                        <p className="text-[#94A3B8] max-w-md mx-auto">Share your link to start collecting honest feedback.</p>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-4 shadow-sm">
                           <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                             <input value={feedbackSearch} onChange={(e) => setFeedbackSearch(e.target.value)} placeholder="Search feedback text..." className="rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-2 text-sm text-[#E2E8F0] outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#64748B]" />
                             <select value={feedbackRange} onChange={(e) => setFeedbackRange(e.target.value)} className="rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-2 text-sm text-[#E2E8F0] outline-none focus:border-[#3B82F6] transition-colors cursor-pointer">
                               <option value="all">All time</option>
                               <option value="7d">Last 7 days</option>
                               <option value="30d">Last 30 days</option>
                             </select>
                             <button onClick={exportFeedbackCsv} className="rounded-xl bg-[#1E293B] border border-[#334155] px-4 py-2 text-sm font-semibold text-[#E2E8F0] hover:bg-[#0F172A] transition-colors">Export CSV</button>
                           </div>
                        </div>
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {filteredFeedback.map((message) => {
                            const linkTitle = links.find((link) => link.linkId === message.linkId)?.title || message.linkId;
                            const isRevealed = revealedMessages.includes(message._id);
                            const showBlur = message.isToxic && !isRevealed;

                            return (
                              <div key={message._id} className="rounded-2xl p-5 md:p-6 relative overflow-hidden border border-[#334155] bg-[#1E293B] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                <div className={`absolute top-0 left-0 w-1 h-full ${message.isToxic ? 'bg-red-500' : 'bg-[#3B82F6]'} rounded-l-2xl`} />
                                
                                <div className="flex-1 relative">
                                  {showBlur && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1E293B]/80 backdrop-blur-md rounded-xl border border-red-100">
                                      <span className="text-xl mb-2">⚠️</span>
                                      <p className="text-xs text-red-600 font-bold tracking-wider uppercase mb-3">Toxic Content Hidden</p>
                                      <button 
                                        onClick={() => setRevealedMessages(prev => [...prev, message._id])}
                                        className="px-4 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors"
                                      >
                                        Reveal Message
                                      </button>
                                    </div>
                                  )}
                                  <p className={`text-[#E2E8F0] text-sm leading-relaxed pl-2 ${showBlur ? 'opacity-20 blur-[2px] select-none' : ''}`}>
                                    {message.message}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between gap-3 mt-5 pl-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-[#0F172A] border border-[#334155] px-2 py-1 rounded-md text-[#94A3B8] truncate max-w-[120px]">{linkTitle}</span>
                                    <button 
                                      onClick={() => deleteFeedback(message._id)}
                                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-[#64748B] font-medium">{new Date(message.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {hasMoreFeedback && (
                          <div className="pt-6 flex justify-center">
                            <button 
                              onClick={loadMoreFeedback}
                              disabled={loadingMoreFeedback}
                              className="px-6 py-2.5 rounded-xl bg-[#1E293B] border border-[#334155] text-[#E2E8F0] text-sm font-semibold hover:bg-[#0F172A] transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              {loadingMoreFeedback ? (
                                <Loader2 size={16} className="animate-spin text-[#94A3B8]" />
                              ) : (
                                <>Load more responses <ArrowRight size={14} /></>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}

                {activeNav === "trash" && (
                  <motion.div key="trash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#E2E8F0]">Trash</h2>
                        <p className="text-[#94A3B8] mt-1">Deleted links still count toward your plan limit.</p>
                      </div>
                    </div>

                    {loadingDeleted ? (
                      <div className="p-12 rounded-2xl border border-[#334155] bg-[#1E293B] text-center flex flex-col items-center gap-4 shadow-sm">
                        <Loader2 className="animate-spin text-[#3B82F6]" size={32} />
                        <p className="text-[#94A3B8]">Loading your trash...</p>
                      </div>
                    ) : deletedLinks.length === 0 ? (
                      <div className="p-12 rounded-2xl border border-[#334155] bg-[#1E293B] text-center shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-[#0F172A] border border-[#334155] flex items-center justify-center mx-auto mb-6">
                          <Archive size={32} className="text-[#94A3B8]" />
                        </div>
                        <p className="text-xl font-bold text-[#E2E8F0] mb-2">Your trash is empty</p>
                        <p className="text-[#94A3B8] text-sm max-w-md mx-auto">Links you delete will appear here.</p>
                      </div>
                    ) : (
                      <div className="grid gap-5 xl:grid-cols-2">
                        {deletedLinks.map((link) => (
                          <div key={link._id} className="rounded-2xl border border-[#334155] bg-[#1E293B] p-6 shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="rounded-md px-2 py-1 text-[10px] font-bold text-white uppercase bg-[#94A3B8]">{link.postType}</span>
                                  <span className="rounded-md border border-[#334155] bg-[#0F172A] px-2 py-1 text-[10px] text-[#94A3B8]">
                                    Deleted {new Date(link.deletedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-[#E2E8F0] line-through decoration-[#64748B] text-[#94A3B8]">{link.title || link.templateKey || "Untitled link"}</h3>
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center border border-[#334155]">
                                <Archive className="text-[#94A3B8]" size={16} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeNav === "plans" && (
                   <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-[#E2E8F0]">Billing & Plans</h2>
                        <p className="text-[#94A3B8] mt-1">Manage your usage and subscription</p>
                      </div>

                      <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 rounded-2xl bg-[#0F172A] border border-[#334155] flex items-center justify-center">
                            <Zap size={24} className="text-[#3B82F6]" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">Current Plan</p>
                            <p className="text-xl font-bold text-[#E2E8F0] mt-1">{usage.plan.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="h-2 w-full rounded-full bg-[#0F172A] border border-[#334155] overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${usage.percentage ?? 0}%` }} className="h-full rounded-full bg-[#3B82F6]" />
                          </div>
                          <p className="text-xs font-medium text-[#94A3B8] mt-2 text-right">{usage.used} / {usage.limit ?? "∞"} links used</p>
                        </div>
                      </div>
                      
                      <div className="grid gap-5 md:grid-cols-3">
                         {["free", "pro", "ultra"].map(planId => (
                            <div key={planId} className={`rounded-2xl border ${usage.plan === planId ? 'border-[#3B82F6] bg-[#3B82F6]/5' : 'border-[#334155] bg-[#1E293B]'} p-6 shadow-sm`}>
                               <p className="text-lg font-bold text-[#E2E8F0] capitalize">{planId}</p>
                               <button onClick={() => setShowPricingModal(true)} className="w-full mt-4 py-2.5 rounded-xl border border-[#334155] bg-[#1E293B] text-[#E2E8F0] text-sm font-semibold hover:bg-[#0F172A] transition-colors shadow-sm">View details</button>
                            </div>
                         ))}
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* The Insights Grid (Right side) */}
            <div className="xl:col-span-1 space-y-6 hidden xl:block">
              <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-[#94A3B8] mb-4 uppercase tracking-widest">Insights Overview</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155] flex items-center justify-between">
                    <p className="text-sm text-[#94A3B8] font-medium">Total Feedback</p>
                    <p className="text-xl font-bold text-[#E2E8F0]">{analytics?.summary?.totalResponses ?? feedback.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155] flex items-center justify-between">
                    <p className="text-sm text-[#94A3B8] font-medium">Active Links</p>
                    <p className="text-xl font-bold text-[#E2E8F0]">{analytics?.summary?.activeLinks ?? 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-between">
                    <p className="text-sm text-[#3B82F6] font-bold">Responses (7d)</p>
                    <p className="text-xl font-bold text-[#3B82F6]">{analytics?.summary?.responsesThisWeek ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#334155] bg-[#0F172A] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} className="text-[#3B82F6]" />
                  <h3 className="text-xs font-bold text-[#E2E8F0] uppercase tracking-widest">Pro Tip</h3>
                </div>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Use <kbd className="bg-[#1E293B] px-1.5 py-0.5 rounded text-xs font-mono text-[#E2E8F0] border border-[#334155] shadow-sm">Cmd+K</kbd> to quickly jump between views, create new links, or access your account settings from anywhere.
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Mobile navigation bar */}
      <nav className="fixed bottom-0 inset-x-0 h-16 border-t border-[#334155] bg-[#1E293B]/90 backdrop-blur-xl flex items-center justify-around z-40 md:hidden px-2">
        <Link to="/" className="p-3 rounded-xl text-[#94A3B8] transition-colors hover:text-[#E2E8F0]">
           <Home size={20} />
        </Link>
        {NAV.slice(0, 4).map(({ id, icon: Icon }) => (
          <button key={id} onClick={() => handleNavSelect(id)} className={`p-3 rounded-xl transition-colors ${activeNav === id ? "text-[#3B82F6] bg-[#3B82F6]/10" : "text-[#94A3B8]"}`}>
             <Icon size={20} />
          </button>
        ))}
      </nav>

      <StoryShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        link={selectedShareLink} 
        username={user?.username || "user"} 
        instagramHandle={user?.instagramHandle}
      />
    </div>
  );
}
