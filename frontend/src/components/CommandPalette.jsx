import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Home, Plus, BarChart3, Link as LinkIcon, Settings, Crown, MessageSquare } from "lucide-react";

export default function CommandPalette({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const ACTIONS = [
    { id: "create", label: "Create New Post", icon: Plus, section: "Actions" },
    { id: "analytics", label: "View Analytics", icon: BarChart3, section: "Navigation" },
    { id: "links", label: "My Links", icon: LinkIcon, section: "Navigation" },
    { id: "feedback", label: "Feedback Responses", icon: MessageSquare, section: "Navigation" },
    { id: "settings", label: "Account Settings", icon: Settings, section: "Preferences" },
    { id: "plans", label: "Upgrade Plan", icon: Crown, section: "Preferences" },
    { id: "home", label: "Go to Home", icon: Home, section: "Navigation" },
  ];

  const filteredActions = ACTIONS.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          onSelect(filteredActions[selectedIndex].id);
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose, onSelect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-0 top-[15vh] z-50 mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-glow"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
              <Search size={20} className="text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-lg text-white placeholder-gray-500 outline-none"
              />
              <div className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-gray-500">
                <kbd className="font-sans">esc</kbd>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredActions.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No results found.
                </div>
              ) : (
                filteredActions.map((action, index) => {
                  const active = index === selectedIndex;
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        onSelect(action.id);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                        active
                          ? "bg-brand/10 text-brand"
                          : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <Icon size={18} className={active ? "text-brand" : "text-gray-400"} />
                      <span className="font-medium">{action.label}</span>
                      <span className="ml-auto text-xs text-gray-500">{action.section}</span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
