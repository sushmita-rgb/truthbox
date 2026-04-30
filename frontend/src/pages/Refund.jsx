import { Link } from "react-router-dom";
import { ArrowLeft, Banknote, HelpCircle, History } from "lucide-react";
import Footer from "../components/Footer";

export default function Refund() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans selection:bg-brand/30 transition-colors duration-500">
      <div className="flex-1 max-w-4xl mx-auto px-6 pt-12 pb-20 w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-brand hover:gap-3 transition-all mb-12">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center shadow-inner">
            <Banknote size={32} className="text-brand" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[var(--text-primary)]">Refund & Cancellation</h1>
            <p className="text-[var(--text-secondary)] mt-1 font-medium">Last updated: April 26, 2026</p>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] p-8 md:p-12 rounded-[2rem] space-y-10 leading-relaxed border border-[var(--border-color)] shadow-xl">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 mb-4">
              <History size={20} className="text-brand" /> 1. Cancellation Policy
            </h2>
            <p className="text-[var(--text-secondary)]">
              You can cancel your Pro or Ultra subscription at any time directly from your Dashboard. Once canceled, you will continue to have access to premium features until the end of your current billing period. No further charges will be made after cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 mb-4">
              <HelpCircle size={20} className="text-brand" /> 2. Refund Eligibility
            </h2>
            <p className="mb-4 text-[var(--text-secondary)]">
              Since Verit provides digital services and immediate access to premium features (unlimited links, AI filtering, etc.), we generally do not offer refunds once a subscription has been activated.
            </p>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl">
              <p className="text-sm text-[var(--text-secondary)]">
                <strong>Exception:</strong> If you were charged due to a technical error or if you have a valid reason for a refund request within 24 hours of purchase, please contact our support team.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">3. Processing Refunds</h2>
            <p className="text-[var(--text-secondary)]">
              Approved refunds will be processed via Razorpay and credited back to your original payment method within 5-7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">4. Plan Changes</h2>
            <p className="text-[var(--text-secondary)]">
              If you upgrade from Pro to Ultra, the unused portion of your Pro plan will be adjusted against the Ultra plan price automatically.
            </p>
          </section>

          <div className="pt-10 border-t border-[var(--border-color)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Need help with a payment? Contact us at <span className="text-brand font-bold">support@Verit.app</span>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
