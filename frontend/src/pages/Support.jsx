import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, HelpCircle, Send, CheckCircle } from "lucide-react";
import api from "../api";
import Footer from "../components/Footer";

const FAQ = [
  {
    q: "Is TruthBox really anonymous?",
    a: "Yes! We do not store any identifying information about the person sending feedback. Only the content of the message is shared with the link owner."
  },
  {
    q: "How do I create a link?",
    a: "Once you log in, go to your dashboard and click 'Create New Link'. You can customize the link title and share it anywhere."
  },
  {
    q: "Can I delete a link?",
    a: "Absolutely. You can manage and delete your links at any time from your dashboard."
  },
  {
    q: "How many links can I create?",
    a: "Free accounts can create up to 5 links. For more, check out our Pro and Ultra plans in the pricing section."
  },
  {
    q: "What is TruthBox Ultra?",
    a: "Ultra is our top-tier plan for influencers and businesses, offering unlimited links, priority support, and advanced analytics."
  }
];

export default function Support() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/system/support", formData);
      setSent(true);
    } catch (err) {
      alert("Failed to send message. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans selection:bg-brand/30 transition-colors duration-500">
      <div className="flex-1 max-w-6xl mx-auto px-6 pt-12 pb-20 w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-brand hover:gap-3 transition-all mb-12">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-[var(--text-primary)] mb-4">Help & Support</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-2">
            Got questions? We've got answers. If you can't find what you're looking for, shoot us a message below.
          </p>
          <p className="text-[var(--text-secondary)]">
            You can also email us directly at: <a href="mailto:veritnowapp@gmail.com" className="text-brand hover:underline font-medium">veritnowapp@gmail.com</a>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <HelpCircle className="text-brand" /> Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <div key={i} className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent)]/30 transition-colors shadow-sm">
                  <h3 className="font-bold text-[var(--text-primary)] mb-2">{item.q}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <MessageCircle className="text-brand" /> Contact Us
            </h2>
            
            <div className="bg-[var(--bg-secondary)] p-8 rounded-[2rem] border border-[var(--border-color)] relative overflow-hidden shadow-xl">
              {sent ? (
                <div className="text-center py-10 animate-fade-in">
                  <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-brand" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Message Sent!</h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-8">We'll get back to you at {formData.email} as soon as possible.</p>
                  <button onClick={() => setSent(false)} className="text-brand font-bold text-sm hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-brand/50 transition-colors"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Your Email</label>
                      <input 
                        required
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-brand/50 transition-colors"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Message</label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-brand/50 transition-colors resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={submitting}
                    className="w-full py-4 rounded-xl bg-brand text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
