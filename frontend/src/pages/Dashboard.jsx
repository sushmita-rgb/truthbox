import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Link as LinkIcon, MessageCircle, Settings, User as UserIcon } from "lucide-react";
import api from "../api";
import TermsModal from "../components/TermsModal";
import SettingsModal from "../components/SettingsModal";
import ProfileDropdown from "../components/ProfileDropdown";

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("termsAccepted") !== "true") {
      setShowTerms(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issuesRes, messagesRes, userRes] = await Promise.all([
          api.get("/issues"),
          api.get("/messages"),
          api.get("/auth/me")
        ]);
        setIssues(issuesRes.data);
        setMessages(messagesRes.data);
        setUser(userRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/i/${id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const handleAcceptTerms = async () => {
    try {
      await api.post("/auth/accept-terms");
      localStorage.setItem("termsAccepted", "true");
      setShowTerms(false);
    } catch (err) {
      alert("Failed to accept terms. Please try again.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <>
    {showTerms && <TermsModal onAccept={handleAcceptTerms} />}
    <div className="min-h-screen p-4 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Dashboard</h1>
        <div className="flex gap-4">
          <Link to="/create" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:scale-105 transition-transform mr-2">
            <Plus size={18}/> New Link
          </Link>
          
          <button onClick={() => setShowSettings(true)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-400 hover:text-white transition-colors flex items-center justify-center">
            <Settings size={20} />
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className="w-12 h-12 rounded-xl overflow-hidden border-2 border-transparent hover:border-[#97ce23] transition-colors bg-black/40 flex items-center justify-center cursor-pointer shadow-lg"
            >
              {user?.avatar ? (
                <img src={user.avatar.startsWith('/uploads') ? (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000') + user.avatar : user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} className="text-[#97ce23]" />
              )}
            </button>
            
            {showDropdown && (
               <ProfileDropdown 
                  user={user} 
                  onClose={() => setShowDropdown(false)} 
                  onOpenSettings={() => setShowSettings(true)}
                  onLogout={handleLogout} 
               />
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Links Created */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-300"><LinkIcon size={20}/> Your Custom Links</h2>
          {issues.length === 0 ? (
            <div className="p-8 glass rounded-3xl text-center text-neutral-500">No links created yet.</div>
          ) : (
            <div className="space-y-4">
              {issues.map(issue => (
                <div key={issue._id} className="glass p-6 rounded-3xl flex justify-between items-start group">
                  <div>
                    <h3 className="font-bold text-lg">{issue.title}</h3>
                    <p className="text-sm text-neutral-400 mt-1 truncate max-w-[250px]">{issue.description || 'No description'}</p>
                    {issue.fileType !== 'none' && (
                      <span className="inline-block mt-3 text-xs px-2 py-1 bg-white/10 rounded-lg text-indigo-300">{issue.fileType.toUpperCase()} attached</span>
                    )}
                  </div>
                  <button onClick={() => copyLink(issue._id)} className="px-4 py-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 rounded-xl text-sm font-medium transition-colors border border-indigo-500/30">
                    Copy Link
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Received Messages */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-purple-300"><MessageCircle size={20}/> Received Feedback</h2>
          {messages.length === 0 ? (
            <div className="p-8 glass rounded-3xl text-center text-neutral-500">No messages received yet. Share your links!</div>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg._id} className="glass p-6 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                  <p className="text-neutral-200 text-lg leading-relaxed">{msg.content}</p>
                  <p className="text-xs text-neutral-500 mt-4 flex items-center gap-2">
                    Reply to: <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">{msg.issueId?.title || "Deleted Link"}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    {showSettings && user && (
      <SettingsModal 
        user={user} 
        onClose={() => setShowSettings(false)} 
        onUpdate={(updatedUser) => setUser(updatedUser)}
        onLogout={handleLogout}
      />
    )}
    </>
  );
}
