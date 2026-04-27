import { useRef, useState } from "react";
import { AlertTriangle, Check, Image as ImageIcon, LogOut, ShieldCheck, Upload, UserCircle2, X } from "lucide-react";
import api from "../api";

const BACKEND_URL = "https://truthbox-production.up.railway.app";

export default function SettingsModal({ user, onClose, onUpdate, onLogout }) {
  const [selectedSections, setSelectedSections] = useState({
    profile: false,
    avatar: false,
    password: false,
  });
  const [formData, setFormData] = useState({
    username: user?.username || "",
    instagramHandle: user?.instagramHandle || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar
      ? (user.avatar.startsWith("/uploads") ? `${BACKEND_URL}${user.avatar}` : user.avatar)
      : null
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleSection = (section) => {
    setSelectedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const wantsProfileUpdate = selectedSections.profile;
    const wantsAvatarUpdate = selectedSections.avatar;
    const wantsPasswordUpdate = selectedSections.password;

    const hasProfileChanges =
      wantsProfileUpdate && (formData.username !== user.username || formData.instagramHandle !== user.instagramHandle);
    const hasPasswordChanges =
      wantsPasswordUpdate && (
        passwordData.currentPassword ||
        passwordData.newPassword ||
        passwordData.confirmPassword
      );
    const hasAvatarChanges = wantsAvatarUpdate && !!avatarFile;

    if (!wantsProfileUpdate && !wantsAvatarUpdate && !wantsPasswordUpdate) {
      setLoading(false);
      showToast("Select what you want to update first.", "error");
      return;
    }

    if (!hasProfileChanges && !hasPasswordChanges && !hasAvatarChanges) {
      setLoading(false);
      showToast("No changes were detected.", "error");
      return;
    }

    if (hasPasswordChanges) {
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setLoading(false);
        showToast("Complete all password fields to change your password.", "error");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setLoading(false);
        showToast("New password and confirmation do not match.", "error");
        return;
      }
    }

    let updatedUser = { ...user };

    try {
      if (hasProfileChanges) {
        const profileRes = await api.put("/auth/profile", formData);
        updatedUser = { ...updatedUser, ...profileRes.data };
      }

      if (hasAvatarChanges) {
        const fileData = new FormData();
        fileData.append("avatar", avatarFile);
        const avatarRes = await api.post("/auth/avatar", fileData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updatedUser.avatar = avatarRes.data.avatar;
      }

      if (hasPasswordChanges) {
        await api.put("/auth/change-password", {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        });

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      setSelectedSections({
        profile: false,
        avatar: false,
        password: false,
      });
      onUpdate(updatedUser);
      showToast("Account settings were updated successfully.");
    } catch (err) {
      showToast(err.response?.data?.message || "Unable to update account settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#171717] border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {toast && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-semibold z-20 transition-all ${toast.type === "error" ? "bg-red-500 text-white" : "bg-[#97ce23] text-[#111111]"}`}>
            {toast.message}
          </div>
        )}

        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white">Account Settings</h2>
            <p className="text-sm text-neutral-500 mt-1">Update your username, profile image, and password.</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 styled-scrollbar">
          <form onSubmit={handleSave} className="space-y-7">
            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-400">Choose what you want to change</p>
              <div className="grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => toggleSection("profile")}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors ${selectedSections.profile ? "border-[#97ce23] bg-[#97ce23]/10 text-white" : "border-white/10 bg-black/30 text-neutral-300 hover:bg-white/5"}`}
                >
                  <UserCircle2 size={18} className={selectedSections.profile ? "text-[#97ce23]" : "text-neutral-500"} />
                  <p className="mt-3 font-semibold">Profile</p>
                  <p className="mt-1 text-xs text-neutral-500">Username</p>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("avatar")}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors ${selectedSections.avatar ? "border-[#97ce23] bg-[#97ce23]/10 text-white" : "border-white/10 bg-black/30 text-neutral-300 hover:bg-white/5"}`}
                >
                  <ImageIcon size={18} className={selectedSections.avatar ? "text-[#97ce23]" : "text-neutral-500"} />
                  <p className="mt-3 font-semibold">Photo</p>
                  <p className="mt-1 text-xs text-neutral-500">Profile image</p>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("password")}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors ${selectedSections.password ? "border-[#97ce23] bg-[#97ce23]/10 text-white" : "border-white/10 bg-black/30 text-neutral-300 hover:bg-white/5"}`}
                >
                  <ShieldCheck size={18} className={selectedSections.password ? "text-[#97ce23]" : "text-neutral-500"} />
                  <p className="mt-3 font-semibold">Password</p>
                  <p className="mt-1 text-xs text-neutral-500">Security update</p>
                </button>
              </div>
            </div>

            {selectedSections.avatar && (
              <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-black/30 px-5 py-6">
                <div className="relative group cursor-pointer mb-3" onClick={() => fileInputRef.current?.click()}>
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
                <p className="text-xs text-neutral-500">Upload a professional profile image</p>
              </div>
            )}

            {selectedSections.profile && (
              <div className="grid gap-5 rounded-2xl border border-white/10 bg-black/30 p-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Username</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#97ce23] transition-colors"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Instagram Handle (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">@</span>
                    <input
                      type="text"
                      placeholder="username"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#97ce23] transition-colors"
                      value={formData.instagramHandle}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value.replace("@", "") })}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-600 mt-2 italic">Used to customize your Story sharing graphics.</p>
                </div>
              </div>
            )}

            {selectedSections.password && (
              <div className="border border-white/10 rounded-2xl p-5 bg-black/30 space-y-4">
                <div className="flex items-center gap-2 text-sm text-neutral-300 font-semibold">
                  <ShieldCheck size={16} className="text-[#97ce23]" />
                  Password Security
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#97ce23] transition-colors"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#97ce23] transition-colors"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#97ce23] transition-colors"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>

                <p className="text-xs text-neutral-500">
                  Use at least 8 characters with uppercase, lowercase, a number, and a special character.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#97ce23] text-[#111111] font-bold hover:bg-[#a6e026] flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving updates..." : <><Check size={18} /> Save Account Changes</>}
            </button>
          </form>

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
                <p className="text-red-400 text-sm mb-4">Do you want to sign out of your account?</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2 rounded-lg bg-black/40 text-neutral-300 hover:bg-black/60">Cancel</button>
                  <button onClick={onLogout} className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600">Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
