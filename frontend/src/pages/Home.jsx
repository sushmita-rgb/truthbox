import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, MessageSquare } from "lucide-react";

const useIntersectionObserver = () => {
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-up-enter-active");
        } else {
          entry.target.classList.remove("fade-up-enter-active");
        }
      },
      { threshold: 0.2 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return ref;
};

const Section = ({ id, children, className = "" }) => {
  const ref = useIntersectionObserver();
  return (
    <section 
      id={id} 
      className={`h-screen w-full flex items-center justify-center snap-start snap-always ${className}`}
    >
      <div ref={ref} className="fade-up-enter w-full max-w-6xl px-6">
        {children}
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth relative">
      
      {/* 1. HOME SECTION */}
      <Section id="home">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight">
            Truth<span className="text-accent">Box</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-sans max-w-2xl mx-auto">
            Receive honest feedback anonymously.
          </p>
          <div className="pt-8">
            <Link 
              to="/signup" 
              className="inline-block px-10 py-4 rounded-full bg-accent text-main font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(151,206,35,0.3)] hover:shadow-[0_0_30px_rgba(151,206,35,0.5)]"
            >
              Generate your link
            </Link>
          </div>
          <div className="pt-4">
            <Link to="/login" className="text-gray-500 hover:text-white transition-colors">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </Section>

      {/* 2. ABOUT SECTION */}
      <Section id="about">
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">About Truth<span className="text-accent">Box</span></h2>
          <p className="text-lg text-gray-400 max-w-3xl mb-16">
            We built TruthBox to help you collect real, unfiltered thoughts from your peers, audience, or customers without the pressure of identity.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 w-full">
            {[
              { icon: <Shield className="w-8 h-8 text-accent" />, title: "Anonymous", desc: "No tracking, no names. Pure honesty." },
              { icon: <Lock className="w-8 h-8 text-accent" />, title: "Secure", desc: "Your data is encrypted and completely private." },
              { icon: <MessageSquare className="w-8 h-8 text-accent" />, title: "Real Feedback", desc: "Get the insights you actually need to grow." }
            ].map((feat, i) => (
              <div key={i} className="glass p-10 rounded-3xl text-left hover:-translate-y-3 transition-all duration-300 group cursor-default">
                <div className="p-4 rounded-2xl bg-white/5 inline-block mb-6 group-hover:bg-accent/10 transition-colors">
                   {feat.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feat.title}</h3>
                <p className="text-gray-400 font-sans leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 3. CONTACT SECTION */}
      <Section id="contact">
        <div className="grid md:grid-cols-2 gap-12 items-center h-full">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold">Contact Us</h2>
            <p className="text-xl text-gray-400 font-sans leading-relaxed">
              Have questions, suggestions, or just want to say hi? We'd love to hear from you.
            </p>
            <div>
              <a 
                href="mailto:truthiisend@gmail.com" 
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl glass font-bold text-xl hover:bg-white/10 transition-colors group"
              >
                <MessageSquare className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                truthiisend@gmail.com
              </a>
            </div>
          </div>
          
          <div className="hidden md:flex justify-center items-center">
            {/* Slight floating animation for illustration */}
            <div className="relative w-72 h-72 animate-[bounce_4s_infinite]">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-[80px]"></div>
              <div className="relative glass w-full h-full rounded-3xl flex items-center justify-center border-accent/20 rotate-12 hover:rotate-0 transition-all duration-500">
                <Shield className="w-32 h-32 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </Section>

    </div>
  );
}
