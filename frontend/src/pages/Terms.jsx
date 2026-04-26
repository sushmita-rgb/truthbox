import { Link } from "react-router-dom";
import VeritLogo from "../components/VeritLogo";
import Footer from "../components/Footer";
import { ArrowLeft, ShieldCheck, Scale, ScrollText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-main/45 flex flex-col font-sans selection:bg-brand/30">
      <div className="flex-1 max-w-4xl mx-auto px-6 pt-12 pb-20 w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-brand hover:gap-3 transition-all mb-12">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Scale size={32} className="text-brand" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">Terms of Service</h1>
            <p className="text-gray-500 mt-1">Last updated: April 26, 2026</p>
          </div>
        </div>

        <div className="glass p-8 md:p-12 rounded-[2rem] space-y-10 leading-relaxed border-white/5">
          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
              <ScrollText size={20} className="text-brand" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Verit, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
              <ShieldCheck size={20} className="text-brand" /> 2. User Conduct
            </h2>
            <p className="mb-4">
              Verit is designed for honest, constructive feedback. You agree not to use the service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Engage in cyberbullying, harassment, or threats of violence.</li>
              <li>Post content that is defamatory, obscene, or hateful.</li>
              <li>Spam users or attempt to exploit the anonymity of the platform.</li>
              <li>Impersonate others or misrepresent your identity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the security of your account and all activities that occur under your username. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Subscriptions & Payments</h2>
            <p>
              Payments for Pro and Ultra plans are processed via Razorpay. Subscriptions are billed monthly and can be canceled at any time from your dashboard. Refunds are handled on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p>
              Verit is provided "as is". We are not responsible for any emotional distress, data loss, or damages resulting from the use of our anonymous feedback platform.
            </p>
          </section>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-white">Questions about our terms?</p>
              <p className="text-xs text-gray-500 mt-1">Contact us at support@Verit.app</p>
            </div>
            <Link to="/support" className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold transition-all">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
