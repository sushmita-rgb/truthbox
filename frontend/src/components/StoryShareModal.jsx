import { useRef, useState } from "react";
import { X, Download, Camera } from "lucide-react";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";

export default function StoryShareModal({ isOpen, onClose, link, username }) {
  const shareRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !link) return null;

  const fullUrl = `${window.location.origin}/feedback/${link.linkId}`;
  const accent = link.accentColor || "#97ce23";

  const handleDownload = async () => {
    if (!shareRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(shareRef.current, {
        useCORS: true,
        backgroundColor: "#000000",
        scale: 2, // Back to high quality
      });
      
      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      a.download = `verit-story.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] w-full max-w-md p-6 relative overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20"
        >
          <X size={20} className="text-gray-400" />
        </button>

        <div className="text-center mb-8 pt-4">
          <h2 className="text-2xl font-black text-white flex items-center justify-center gap-3">
            <Camera className="text-[#97ce23]" /> Share the Vibe
          </h2>
          <p className="text-sm text-gray-500 mt-2">The perfect graphic for your Instagram Story</p>
        </div>

        {/* The Graphic to be captured */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center py-4">
          <div 
            ref={shareRef}
            className="w-[320px] h-[568px] relative rounded-[3rem] overflow-hidden shrink-0"
            style={{
              background: "#000000",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            {/* High-End Background Glows */}
            <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(151, 206, 35, 0.25) 0%, transparent 70%)" }} />
            <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30" style={{ background: "radial-gradient(circle at center, #111 0%, #000 100%)" }} />
            
            <div className="relative z-10 h-full flex flex-col items-center justify-between p-10 text-center">
              
              <div className="w-full">
                {/* User Badge */}
                <div style={{ 
                  backgroundColor: "rgba(255,255,255,0.05)", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  padding: "8px 20px", 
                  borderRadius: "100px", 
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "40px"
                }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#97ce23", boxShadow: "0 0 10px #97ce23" }} />
                  <p style={{ fontSize: "12px", fontWeight: "700", color: "#ffffff", letterSpacing: "2px", textTransform: "uppercase", margin: 0, fontFamily: "sans-serif" }}>@{username}</p>
                </div>

                {/* Main Text */}
                <h3 style={{ fontSize: "32px", fontWeight: "900", color: "#ffffff", lineHeight: "1.1", marginBottom: "16px", fontFamily: "Poppins, sans-serif", letterSpacing: "-1px" }}>
                  {link.title || "Send me an anonymous message!"}
                </h3>
                <p style={{ fontSize: "16px", color: "#9CA3AF", lineHeight: "1.6", margin: "0 auto", maxWidth: "240px", fontFamily: "Inter, sans-serif" }}>
                  {link.description || "I won't know who sent it. Be honest!"}
                </p>
              </div>

              {/* QR and Footer */}
              <div className="w-full flex flex-col items-center gap-8">
                <div style={{ 
                  backgroundColor: "#ffffff", 
                  padding: "16px", 
                  borderRadius: "24px", 
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}>
                  <QRCodeSVG value={fullUrl} size={140} level="H" includeMargin={false} />
                </div>

                <div style={{ 
                  padding: "16px 32px", 
                  borderRadius: "20px", 
                  border: "1px solid rgba(151, 206, 35, 0.3)", 
                  width: "100%", 
                  backgroundColor: "rgba(151, 206, 35, 0.1)",
                  boxShadow: "0 0 20px rgba(151, 206, 35, 0.1)"
                }}>
                  <p style={{ fontSize: "12px", fontWeight: "800", color: "#97ce23", textTransform: "uppercase", letterSpacing: "3px", margin: 0, fontFamily: "sans-serif" }}>SCAN TO REPLY</p>
                </div>

                <div style={{ opacity: "0.4", display: "flex", alignItems: "center", gap: "6px" }}>
                   <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#fff" }} />
                   <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffffff", letterSpacing: "2px", textTransform: "uppercase" }}>Verit</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-8 w-full py-5 rounded-[1.5rem] bg-[#97ce23] text-black font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(151,206,35,0.3)]"
        >
          {downloading ? "Preparing..." : <><Download size={20} /> Download for Story</>}
        </button>

      </div>
    </div>
  );
}
