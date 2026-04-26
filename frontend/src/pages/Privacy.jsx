import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Eye, Database, Share2 } from "lucide-react";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-main/45 flex flex-col font-sans selection:bg-brand/30">
      <div className="flex-1 max-w-4xl mx-auto px-6 pt-12 pb-20 w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-brand hover:gap-3 transition-all mb-12">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Lock size={32} className="text-brand" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
            <p className="text-gray-500 mt-1">Last updated: April 26, 2026</p>
          </div>
        </div>

        <div className="glass p-8 md:p-12 rounded-[2rem] space-y-10 leading-relaxed border-white/5">
          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
              <Eye size={20} className="text-brand" /> 1. Information We Collect
            </h2>
            <p className="mb-4">
              We collect minimal information to provide a safe and functional anonymous platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Account Info:</strong> Email, Username, and Password (hashed).</li>
              <li><strong>Feedback Content:</strong> The messages, images, or files sent to you.</li>
              <li><strong>Usage Data:</strong> IP address (for geo-mapping and security), browser type, and interaction data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
              <Database size={20} className="text-brand" /> 2. How We Use Your Data
            </h2>
            <p>
              Your data is used to maintain your account, process payments, and facilitate the anonymous feedback loop. We use Gemini AI to scan feedback for toxicity to ensure user safety.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
              <Share2 size={20} className="text-brand" /> 3. Data Sharing
            </h2>
            <p>
              We **never** sell your data. We only share information with third-party services necessary for the app to function:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-sm text-gray-400">
              <li><strong>Razorpay:</strong> For secure payment processing.</li>
              <li><strong>Cloudinary:</strong> For secure image and file hosting.</li>
              <li><strong>Resend:</strong> For transactional emails and OTPs.</li>
              <li><strong>Google Gemini:</strong> For automated toxicity filtering.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Your Rights</h2>
            <p>
              You have the right to access, download, or delete your personal data. You can delete your account and all associated data directly from your dashboard settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Security</h2>
            <p>
              We implement industry-standard security measures, including HTTPS encryption and hashed passwords, to protect your data from unauthorized access.
            </p>
          </section>

          <div className="pt-10 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              By using Verit, you consent to our Privacy Policy.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
