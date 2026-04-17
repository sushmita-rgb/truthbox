import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Link as LinkIcon, LogOut, MessageCircle } from "lucide-react";
import api from "../api";

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issuesRes, messagesRes] = await Promise.all([
          api.get("/issues"),
          api.get("/messages")
        ]);
        setIssues(issuesRes.data);
        setMessages(messagesRes.data);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Dashboard</h1>
        <div className="flex gap-4">
          <Link to="/create" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:scale-105 transition-transform">
            <Plus size={18}/> New Link
          </Link>
          <button onClick={handleLogout} className="p-3 rounded-2xl glass hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
            <LogOut size={20} />
          </button>
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
  );
}
