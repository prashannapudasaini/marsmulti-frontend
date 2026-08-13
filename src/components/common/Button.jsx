import React from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold tracking-wide rounded-xl transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b1113] focus-visible:ring-offset-2 disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] select-none cursor-pointer";
  
  const variants = {
    primary: "bg-[#7b1113] hover:bg-[#5e0c0e] text-white shadow-sm hover:shadow-md border border-transparent",
    secondary: "bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] border border-[#e5e5ea] shadow-xs hover:border-slate-300",
    outline: "bg-transparent border border-[#7b1113]/80 hover:border-[#7b1113] text-[#7b1113] hover:bg-[#7b1113]/5",
    ghost: "bg-transparent text-slate-600 hover:text-[#1d1d1f] hover:bg-[#f5f5f7]/80 border border-transparent",
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="opacity-90">Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
