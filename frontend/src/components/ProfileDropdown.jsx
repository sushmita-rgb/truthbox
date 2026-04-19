import { Settings, LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ProfileDropdown({ user, onClose, onOpenSettings, onLogout }) {
  const dropdownRef = useRef(null);

  // Close dropdown if scrolling or clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!user) return null;

  return (
    <div ref={dropdownRef} className="absolute top-full right-0 mt-3 w-64 bg-[#1c1c1c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-40 transform origin-top-right">
      
      {/* User Info Header */}
      <div className="p-5 border-b border-white/5 bg-white/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-[#97ce23]/50 bg-black/40 flex-shrink-0 flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar.startsWith('/uploads') ? (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000') + user.avatar : user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={20} className="text-[#97ce23]" />
          )}
        </div>
        <div className="overflow-hidden">
          <p className="text-white font-bold truncate text-lg">{user.username}</p>
          <p className="text-neutral-500 text-xs truncate">{user.email}</p>
        </div>
      </div>

      <div className="p-2">
        <button 
          onClick={() => { onClose(); onOpenSettings(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-neutral-300 hover:text-white transition-colors text-left text-sm font-medium"
        >
          <Settings size={18} className="text-[#97ce23]" />
          Account Settings
        </button>
        
        <button 
          onClick={() => { onClose(); onLogout(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors text-left text-sm font-medium mt-1"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
      
    </div>
  );
}
