import { User as UserIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { BACKEND_URL } from "../api";

// BACKEND_URL is now imported from api.js

export default function ProfileDropdown({ user, onClose }) {
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
    <div ref={dropdownRef} className="w-56 bg-[#131313] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in p-5">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden border border-[#97ce23]/50 bg-black/40 flex-shrink-0 flex items-center justify-center">
          {user.avatar ? (
            <img
              src={user.avatar.startsWith("/uploads") ? `${BACKEND_URL}${user.avatar}` : user.avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserIcon size={28} className="text-[#97ce23]" />
          )}
        </div>
        <p className="mt-4 text-white font-bold text-lg truncate max-w-full">{user.username}</p>
      </div>
    </div>
  );
}
