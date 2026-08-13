import React from "react";

export function Spinner({ size = "md", label = "Loading showroom catalog..." }) {
  const sizeClass = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[2.5px]",
    lg: "w-11 h-11 border-3",
  }[size] || "w-8 h-8 border-[2.5px]";

  return (
    <div className="flex flex-col items-center justify-center p-12 gap-3.5 text-center animate-fadeIn">
      <div className={`${sizeClass} rounded-full border-[#e5e5ea] border-t-[#7b1113] animate-spin`} />
      {label && <p className="text-xs font-semibold text-slate-500 tracking-wide">{label}</p>}
    </div>
  );
}
