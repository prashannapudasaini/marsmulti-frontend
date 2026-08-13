import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Drawer({ isOpen, onClose, title, subtitle, children, footer, className = "" }) {
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
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />
      {/* Drawer Container */}
      <div className={`relative w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-white border-l border-[#e5e5ea] shadow-2xl h-full flex flex-col z-10 text-[#1d1d1f] transform transition-transform duration-300 ease-out animate-slideLeft ${className}`}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e5e5ea] flex items-center justify-between bg-[#f8f2f2]/90 backdrop-blur-md sticky top-0 z-20">
          <div>
            {title && <h2 className="text-xl font-extrabold bg-gradient-to-r from-[#7b1113] via-[#9e2023] to-[#d97706] bg-clip-text text-transparent tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7b1113]/20"
            aria-label="Close drawer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-slate-100" data-lenis-prevent>
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-5 border-t border-[#e5e5ea] bg-white sticky bottom-0 z-20 shadow-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
