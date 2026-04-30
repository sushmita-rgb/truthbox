import { Link } from "react-router-dom";
import VeritLogo from "../components/VeritLogo";
import Footer from "../components/Footer";
import { ArrowLeft, ShieldCheck, Scale, ScrollText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans selection:bg-brand/30 transition-colors duration-500">
      <div className="flex-1 max-w-4xl mx-auto px-6 pt-12 pb-20 w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-brand hover:gap-3 transition-all mb-12">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center shadow-inner">
            <Scale size={32} className="text-brand" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[var(--text-primary)]">Terms of Service</h1>
            <p className="text-[var(--text-secondary)] mt-1 font-medium">Last updated: April 26, 2026</p>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] p-8 md:p-12 rounded-[2rem] space-y-10 leading-relaxed border border-[var(--border-color)] shadow-xl">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 mb-4">
              <ScrollText size={20} className="text-brand" /> 1. Acceptance of Terms
            </h2>
            <p className="text-[var(--text-secondary)]">
              By accessing and using Verit, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 mb-4">
              <ShieldCheck size={20} className="text-brand" /> 2. User Conduct
            </h2>
            <p className="mb-4 text-[var(--text-secondary)]">
              Verit is designed for honest, constructive feedback. You agree not to use the service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-[var(--text-secondary)]">
              <li>Engage in cyberbullying, harassment, or threats of violence.</li>
              <li>Post content that is defamatory, obscene, or hateful.</li>
              <li>Spam users or attempt to exploit the anonymity of the platform.</li>
              <li>Impersonate others or misrepresent your identity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">3. Account Responsibility</h2>
            <p className="text-[var(--text-secondary)]">
              You are responsible for maintaining the security of your account and all activities that occur under your username. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">4. Subscriptions & Payments</h2>
            <p className="text-[var(--text-secondary)]">
              Payments for Pro and Ultra plans are processed via Razorpay. Subscriptions are billed monthly and can be canceled at any time from your dashboard. Refunds are handled on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">5. Limitation of Liability</h2>
            <p className="text-[var(--text-secondary)]">
              Verit is provided "as is". We are not responsible for any emotional distress, data loss, or damages resulting from the use of our anonymous feedback platform.
            </p>
          </section>

          <div className="pt-10 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">Questions about our terms?</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Contact us at support@Verit.app</p>
            </div>
            <Link to="/support" className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-sm font-bold transition-all">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
