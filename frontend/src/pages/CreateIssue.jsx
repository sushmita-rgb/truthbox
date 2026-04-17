import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Link as LinkIcon } from "lucide-react";
import api from "../api";

export default function CreateIssue() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [method, setMethod] = useState("file"); // 'file' or 'link'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (method === "file" && file) {
        formData.append("file", file);
      } else if (method === "link" && linkUrl) {
        formData.append("linkUrl", linkUrl);
      }

      await api.post("/issues", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-3xl mx-auto">
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="glass p-8 md:p-12 rounded-3xl animate-fade-in-up">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">Create New Link</h2>
        <p className="text-neutral-400 mb-8">Ask a question, share an image/video, or attach a link to get anonymous feedback on it.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Title / Question</label>
            <input 
              type="text" 
              required
              maxLength={150}
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="E.g. Rate my new portfolio design!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Description (Optional)</label>
            <textarea 
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px]"
              placeholder="Add more context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
            <div className="flex gap-4 mb-2">
              <button type="button" onClick={() => setMethod('file')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${method === 'file' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-black/30 text-neutral-400'}`}>Upload File</button>
              <button type="button" onClick={() => setMethod('link')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${method === 'link' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-black/30 text-neutral-400'}`}>Attach URL Link</button>
            </div>

            {method === 'file' ? (
              <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-indigo-400/50 transition-colors">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,video/*" onChange={e => setFile(e.target.files[0])} />
                <Upload className="mx-auto text-neutral-500 mb-2" />
                {file ? <span className="text-indigo-300">{file.name}</span> : <span className="text-neutral-400">Click or drag image/video</span>}
              </div>
            ) : (
              <div>
                <div className="flex items-center bg-black/50 border border-white/10 rounded-2xl px-4 py-3 focus-within:ring-2 ring-indigo-500/50">
                  <LinkIcon size={18} className="text-neutral-500 mr-3" />
                  <input type="url" placeholder="https://..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="bg-transparent w-full focus:outline-none text-white" />
                </div>
              </div>
            )}
          </div>

          <button disabled={loading} className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all mt-4">
            {loading ? "Generating Link..." : "Generate Magic Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
