import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, subtitle, children, className = "" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 animate-fadeIn">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div className={`relative bg-white border border-[#e5e5ea] rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto max-w-lg w-full z-10 p-6 sm:p-8 text-[#1d1d1f] transition-all transform animate-scaleIn flex flex-col ${className}`}>
        {(title || subtitle) && (
          <div className="flex items-start justify-between pb-5 border-b border-[#e5e5ea]/80 mb-6">
            <div className="pr-4">
              {title && <h3 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#7b1113] via-[#9e2023] to-[#d97706] bg-clip-text text-transparent">{title}</h3>}
              {subtitle && <p className="text-xs font-medium text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-xl transition-all duration-200 ml-auto focus:outline-none focus:ring-2 focus:ring-[#7b1113]/20"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
