import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import { ArrowLeft, Shield, Link as LinkIcon, MessageSquare, AlertTriangle, Calendar, User, Globe, MapPin } from "lucide-react";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/admin/users/${id}/details`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch user details", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading Dossier...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-400">User not found.</div>;

  const { user, links, feedback } = data;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation */}
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Profile Header */}
        <div className="glass rounded-3xl p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
            <div className="w-24 h-24 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-500" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-extrabold">{user.username}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user.plan === "ultra" ? "bg-white text-black" : 
                  user.plan === "pro" ? "bg-accent text-black" : 
                  "bg-white/10 text-gray-300"
                }`}>
                  {user.plan}
                </span>
                {user.isBanned && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={12} /> Banned
                  </span>
                )}
              </div>
              <p className="text-gray-400 flex items-center gap-4 text-sm mt-2">
                <span>{user.email}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {user.country || "Unknown"}</span>
              </p>
            </div>

            <div className="flex gap-4">
              <div className="text-center px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold">{links.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Links</p>
              </div>
              <div className="text-center px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold text-accent">{feedback.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Feedback</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Split */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left: Uploads & Links */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
              <LinkIcon className="text-blue-400" size={20} /> Content Created
            </h2>
            
            {links.length === 0 ? (
              <p className="text-gray-500 text-sm">This user hasn't created any links yet.</p>
            ) : (
              <div className="grid gap-4">
                {links.map(link => (
                  <div key={link._id} className="glass rounded-2xl p-4 border border-white/5 flex gap-4 transition-all hover:bg-white/5">
                    {link.fileUrl ? (
                      <a href={link.fileUrl} target="_blank" rel="noreferrer" className="w-24 h-24 shrink-0 rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center relative group">
                        {link.fileUrl.endsWith(".mp4") || link.fileUrl.endsWith(".webm") ? (
                          <video src={link.fileUrl} className="w-full h-full object-cover" />
                        ) : link.fileUrl.endsWith(".pdf") ? (
                          <div className="text-xs text-gray-400 font-mono">PDF</div>
                        ) : (
                          <img src={link.fileUrl} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">View Full</span>
                        </div>
                      </a>
                    ) : (
                      <div className="w-24 h-24 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500">
                        Text Only
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-white truncate">{link.title || "Untitled Link"}</h3>
                        <span className="text-xs text-gray-500 shrink-0">{new Date(link.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{link.description || "No description provided."}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-white/10 capitalize text-gray-300">
                          {link.postType} post
                        </span>
                        <a href={`/feedback/${link.linkId}`} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
                          View Live Link ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Received Feedback */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
              <MessageSquare className="text-purple-400" size={20} /> Received Feedback
            </h2>
            
            {feedback.length === 0 ? (
              <p className="text-gray-500 text-sm">No feedback received yet.</p>
            ) : (
              <div className="grid gap-4">
                {feedback.map(item => (
                  <div key={item._id} className="glass rounded-2xl p-5 border border-white/5 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-purple-500 rounded-l-2xl opacity-50" />
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                        <Globe size={12} /> {item.country || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                      "{item.message}"
                    </p>
                    
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <p className="text-xs text-gray-500">
                        On link: <span className="text-gray-400 font-medium">{links.find(l => l.linkId === item.linkId)?.title || item.linkId}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
