import { Link } from "react-router-dom";
import VeritLogo from "./VeritLogo";
import { Send, Globe, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-black border-t border-white/5 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-2 space-y-6">
            <VeritLogo className="h-10 w-auto" showTagline={false} />
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              The world's most professional anonymous feedback platform. Built for growth, safety, and real human connection.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-brand hover:bg-white/10 transition-all"><Send size={18} /></a>
              <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-brand hover:bg-white/10 transition-all"><Globe size={18} /></a>
              <a href="mailto:support@Verit.app" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-brand hover:bg-white/10 transition-all"><Mail size={18} /></a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/signup" className="text-sm text-gray-500 hover:text-brand transition-colors">Create Link</Link></li>
              <li><Link to="/dashboard" className="text-sm text-gray-500 hover:text-brand transition-colors">My Dashboard</Link></li>
              <li><a href="/#pricing" className="text-sm text-gray-500 hover:text-brand transition-colors">Pricing & Plans</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-brand transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-brand transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="text-sm text-gray-500 hover:text-brand transition-colors">Refund Policy</Link></li>
              <li><Link to="/support" className="text-sm text-gray-500 hover:text-brand transition-colors">Help & Support</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            © 2026 Verit. Built with ❤️ for the anonymous web.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-gray-700 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
