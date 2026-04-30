import { Link, useLocation } from "react-router-dom";
import VeritLogo from "./VeritLogo";
import { Send, Globe, Mail } from "lucide-react";

export default function Footer() {
  const location = useLocation();

  return (
    <footer className="relative z-10 bg-transparent border-t border-[var(--border-color)] pt-16 pb-8 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-2 space-y-6">
            <VeritLogo className="h-10 w-auto" showTagline={false} />
            <p className="text-[var(--text-secondary)] text-sm max-w-xs leading-relaxed">
              The world's most professional anonymous feedback platform. Built for growth, safety, and real human connection.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className={`p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-secondary)]/80 transition-all ${location.pathname === '/dashboard' ? 'ring-2 ring-[var(--accent)] text-[var(--text-primary)]' : ''}`} title="Dashboard">
                <Send size={18} />
              </Link>
              <Link to="/" className={`p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-secondary)]/80 transition-all ${location.pathname === '/' ? 'ring-2 ring-[var(--accent)] text-[var(--text-primary)]' : ''}`} title="Home">
                <Globe size={18} />
              </Link>
              <Link to="/support" className={`p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-secondary)]/80 transition-all ${location.pathname === '/support' ? 'ring-2 ring-[var(--accent)] text-[var(--text-primary)]' : ''}`} title="Support">
                <Mail size={18} />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/signup" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Create Link</Link></li>
              <li><Link to="/dashboard" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">My Dashboard</Link></li>
              <li><a href="/#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Pricing & Plans</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Refund Policy</Link></li>
              <li><Link to="/support" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Help & Support</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-bold">
            © 2026 TruthBox. Built with passion for creators.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
