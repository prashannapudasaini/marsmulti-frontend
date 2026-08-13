import React from "react";

export function Input({ label, error, helperText, className = "", id, as = "input", children, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "_") : Math.random().toString(36).substring(7));
  const Component = as === "textarea" ? "textarea" : as === "select" ? "select" : "input";

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-wider text-slate-700 select-none">
          {label}
        </label>
      )}
      <Component
        id={inputId}
        className={`w-full bg-[#ffffff] border ${
          error ? "border-rose-500 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500" : "border-[#e5e5ea] text-[#1d1d1f] hover:border-slate-300 focus:border-[#7b1113] focus:ring-[#7b1113]/15"
        } rounded-xl px-4 py-2.5 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 shadow-xs ${
          as === "textarea" ? "min-h-[90px] resize-y" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </Component>
      {error && <span className="text-xs font-semibold text-rose-600 mt-0.5 animate-fadeIn">{error}</span>}
      {!error && helperText && <span className="text-xs font-medium text-slate-500 mt-0.5">{helperText}</span>}
    </div>
  );
}
