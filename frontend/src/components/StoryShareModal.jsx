import { useRef, useState } from "react";
import { X, Download, Camera } from "lucide-react";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";

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
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#000000"
      });
      
      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      a.download = `truthbox-${link.linkId}-story.png`;
      a.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
      alert("Failed to generate image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-white/10 rounded-3xl w-full max-w-md p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-white/10 rounded-full transition-colors z-20"
        >
          <X size={20} className="text-gray-400" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <Camera className="text-pink-500" /> Share to Story
          </h2>
          <p className="text-sm text-gray-400 mt-1">Download this graphic and post it to Instagram</p>
        </div>

        {/* The Graphic to be captured */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center py-4">
          <div 
            ref={shareRef}
            className="w-[300px] h-[533px] relative rounded-3xl overflow-hidden shrink-0 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${accent}22 0%, #000 100%)`,
              border: `1px solid ${accent}44`
            }}
          >
            {/* Background Decorations - Simplified (no blurs for html2canvas compatibility) */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-40" style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }} />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-40" style={{ background: `radial-gradient(circle, #a855f7 0%, transparent 70%)` }} />
            
            <div className="relative z-10 h-full flex flex-col items-center justify-between p-8 text-center">
              
              <div className="mt-8">
                <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 inline-block mb-6">
                  <p className="text-xs font-bold text-white tracking-widest uppercase">@{username}</p>
                </div>
                <h3 className="text-2xl font-extrabold text-white leading-tight mb-2">
                  {link.title || "Send me an anonymous message!"}
                </h3>
                {link.description && (
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {link.description}
                  </p>
                )}
              </div>

              <div className="mb-10 w-full flex flex-col items-center">
                <div className="bg-white p-3 rounded-2xl shadow-xl mb-4">
                  <QRCodeCanvas value={fullUrl} size={120} level="H" includeMargin={false} />
                </div>
                <div className="px-6 py-3 rounded-xl border border-white/20 w-full" style={{ background: `${accent}22` }}>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">Scan or click link in bio</p>
                </div>
              </div>
              
              <div className="absolute bottom-4 opacity-50 flex items-center gap-1">
                <span className="text-[10px] font-bold text-white">TruthBox.app</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-6 w-full py-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {downloading ? (
            "Generating Graphic..."
          ) : (
            <>
              <Download size={18} /> Download Image
            </>
          )}
        </button>

      </div>
    </div>
  );
}
