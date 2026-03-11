import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface ChatAssistantProps {
  whatsappNumber: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ whatsappNumber }) => {
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    // Show the bubble after a short delay
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hello! I'm interested in your services.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Helper Bubble */}
      {showBubble && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-br-none shadow-xl border border-slate-200 dark:border-slate-700 max-w-[250px] animate-in slide-in-from-bottom-5 fade-in duration-500 relative">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowBubble(false);
                }}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                <X className="h-3 w-3" />
            </button>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium pr-6">
                Need help? Chat with us directly on WhatsApp!
            </p>
        </div>
      )}

      <button
        onClick={handleWhatsAppClick}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-emerald-500/30 hover:bg-[#128C7E] transition-all hover:scale-110 animate-in fade-in zoom-in group relative"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7 text-white fill-current" />
        
        {/* Pulse effect */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping group-hover:opacity-0 duration-1000"></span>
      </button>
    </div>
  );
};
