import { useState } from "react";
import { Check, ShieldAlert } from "lucide-react";

export default function TermsModal({ onAccept }) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!agreed) return;
    setLoading(true);
    await onAccept();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass p-8 md:p-10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
              <ShieldAlert className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Terms & Conditions
            </h2>
          </div>

          <p className="text-neutral-400 mb-6 text-sm">
            Please read and accept our rules to ensure a safe and respectful environment for everyone.
          </p>

          {/* Scrollable Terms Content */}
          <div className="flex-1 overflow-y-auto pr-4 mb-8 space-y-6 text-neutral-300 styled-scrollbar">
            <section className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-3">1. Rules for Users (Posting Content)</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-neutral-400">
                <li>No sexual or explicit content is allowed.</li>
                <li>No abusive, offensive, or harsh language.</li>
                <li>Maintain a professional and respectful tone at all times.</li>
                <li>Do not post misleading, false, or harmful information.</li>
              </ul>
            </section>

            <section className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-3">2. Rules for Feedback Providers</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-neutral-400">
                <li>Feedback must be constructive and respectful.</li>
                <li>Avoid personal attacks or targeting individuals.</li>
                <li>Use clear and professional language.</li>
                <li>Do not include inappropriate, sensitive, or offensive content.</li>
              </ul>
            </section>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <label className="flex items-start gap-4 cursor-pointer group mb-6">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
                  ${agreed ? 'bg-indigo-500 border-indigo-500' : 'bg-black/50 border-neutral-600 group-hover:border-indigo-400'}`}>
                  <Check size={14} className={`text-white transition-transform duration-200 ${agreed ? 'scale-100' : 'scale-0'}`} />
                </div>
              </div>
              <span className="text-sm font-medium text-neutral-300 select-none group-hover:text-white transition-colors">
                I have read and agree to these Terms & Conditions.
              </span>
            </label>

            <button
              onClick={handleContinue}
              disabled={!agreed || loading}
              className={`w-full py-4 rounded-xl font-bold transition-all duration-300
                ${agreed 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5' 
                  : 'bg-white/5 text-neutral-500 cursor-not-allowed'
                }`}
            >
              {loading ? "Processing..." : "Continue"}
            </button>
            <div className="text-center mt-4">
               <a href="#" className="text-xs text-neutral-500 hover:text-indigo-400 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .styled-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}
