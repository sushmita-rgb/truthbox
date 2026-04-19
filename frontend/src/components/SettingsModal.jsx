import { useState, useRef } from "react";
import { X, Upload, Check, LogOut, AlertTriangle } from "lucide-react";
import api from "../api";

export default function SettingsModal({ user, onClose, onUpdate, onLogout }) {
  const [formData, setFormData] = useState({ username: user?.username || "", email: user?.email || "" });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? (user.avatar.startsWith('/uploads') ? (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000') + user.avatar : user.avatar) : null);
  const [avatarFile, setAvatarFile] = useState(null);
  
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    let updatedUser = { ...user };
    try {
      // 1. Update text profile
      if (formData.username !== user.username || formData.email !== user.email) {
        const res = await api.put("/auth/profile", formData);
        updatedUser = { ...updatedUser, ...res.data };
      }
      
      // 2. Upload avatar if selected
      if (avatarFile) {
        const fileData = new FormData();
        fileData.append("avatar", avatarFile);
        const resSettings = await api.post("/auth/avatar", fileData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        updatedUser.avatar = resSettings.data.avatar;
      }

      onUpdate(updatedUser);
      showToast("Profile fully updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1c1c1c] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Toast Notification */}
        {toast && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-semibold z-20 transition-all ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-[#97ce23] text-[#1c1c1c]'}`}>
            {toast.message}
          </div>
        )}

        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 styled-scrollbar">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer mb-2" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-[#97ce23] bg-black/40 flex items-center justify-center">
                  {avatarPreview ? (
                     <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                     <span className="text-4xl font-bold text-[#97ce23]">{formData.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload size={24} className="text-white" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
              </div>
              <p className="text-xs text-neutral-500">Tap to upload picture</p>
            </div>

            {/* Profile Inputs */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Username</label>
              <input 
                type="text" 
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#97ce23] transition-colors"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#97ce23] transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#97ce23] text-[#1c1c1c] font-bold hover:bg-[#a6e026] flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : <><Check size={18} /> Save Changes</>}
            </button>
          </form>

          {/* Logout Section */}
          <div className="mt-10 pt-6 border-t border-white/5">
            {!showLogoutConfirm ? (
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 flex justify-center items-center gap-2 transition-colors"
              >
                <LogOut size={18} /> Sign Out
              </button>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center animate-fade-in">
                <AlertTriangle className="mx-auto text-red-500 mb-2" size={24} />
                <p className="text-red-400 text-sm mb-4">Are you sure you want to log out?</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2 rounded-lg bg-black/40 text-neutral-300 hover:bg-black/60">Cancel</button>
                  <button onClick={onLogout} className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600">Yes, Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
