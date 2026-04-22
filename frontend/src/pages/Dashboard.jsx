import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link as LinkIcon, MessageSquare, Copy, LogOut } from "lucide-react";
import api from "../api";

export default function Dashboard() {
  const [feedback, setFeedback] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkId, setLinkId] = useState(null);

  // ✅ NEW STATE
  const [postContent, setPostContent] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedbackRes, userRes] = await Promise.all([
          api.get("/feedback/my-feedback"),
          api.get("/auth/me")
        ]);
        setFeedback(feedbackRes.data);
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

  // ✅ UPDATED FUNCTION
  const createPostAndGenerateLink = async () => {
    if (!postContent.trim()) {
      alert("Please enter something");
      return;
    }

    try {
      const res = await api.post("/links/create-link", {
        content: postContent
      });

      setLinkId(res.data.linkId);
      setPostContent("");
    } catch (err) {
      alert("Failed to create post");
    }
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/feedback/${id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-main text-white font-sans">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-main text-white font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold font-heading mb-1">
              Welcome, {user?.username}
            </h1>
            <p className="text-gray-400">View your anonymous feedback</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* ✅ Create Post Section */}
        <div className="glass p-10 rounded-3xl text-center space-y-6">
          <h2 className="text-2xl font-bold font-heading">Create Post</h2>

          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Write something..."
            className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white outline-none"
            rows={4}
          />

          <button
            onClick={createPostAndGenerateLink}
            className="px-10 py-4 rounded-xl bg-accent text-main font-bold text-lg hover:scale-105 transition-transform"
          >
            Post & Generate Link
          </button>
        </div>

        {/* Link Generation Section */}
        <div className="glass p-10 rounded-3xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
            <LinkIcon className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold font-heading">
            Your Feedback Link
          </h2>

          {linkId ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <div className="px-6 py-4 bg-black/40 rounded-xl font-mono text-gray-300 w-full sm:w-auto text-center border border-white/10">
                {window.location.origin}/feedback/{linkId}
              </div>
              <button
                onClick={() => copyLink(linkId)}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-accent text-main font-bold rounded-xl hover:scale-105 transition-transform w-full sm:w-auto"
              >
                <Copy size={20} /> Copy
              </button>
            </div>
          ) : (
            <p className="text-gray-500">
              Create a post to generate your unique link
            </p>
          )}
        </div>

        {/* Feedback Messages */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-heading flex items-center gap-3">
            <MessageSquare size={24} className="text-accent" />
            Received Feedback
          </h2>

          {feedback.length === 0 ? (
            <div className="p-12 glass rounded-3xl text-center text-gray-500">
              No messages received yet. Share your link to get started!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {feedback.map((msg) => (
                <div
                  key={msg._id}
                  className="glass p-8 rounded-3xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-accent"></div>
                  <p className="text-gray-200 text-lg leading-relaxed">
                    {msg.message}
                  </p>
                  <p className="text-sm text-gray-500 mt-6 flex items-center justify-between">
                    <span>Anonymous</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
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
