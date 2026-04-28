import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon size={20} className="group-hover:rotate-12 transition-transform" />
      ) : (
        <Sun size={20} className="group-hover:rotate-90 transition-transform" />
      )}
    </button>
  );
}
