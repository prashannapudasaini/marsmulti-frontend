import React from "react";

export function Badge({ status, count, className = "" }) {
  const badgeBase = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-tight transition-colors duration-200";

  if (count !== undefined) {
    if (count <= 0) {
      return (
        <span className={`${badgeBase} bg-slate-100 text-slate-600 border border-slate-200/80 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Out of Stock
        </span>
      );
    }
    if (count <= 3) {
      return (
        <span className={`${badgeBase} bg-[#7b1113]/5 text-[#7b1113] border border-[#7b1113]/20 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#7b1113] animate-pulse" />
          Only {count} Left
        </span>
      );
    }
    return (
      <span className={`${badgeBase} bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        In Stock ({count})
      </span>
    );
  }

  return (
    <span className={`${badgeBase} bg-[#f5f5f7] text-[#1d1d1f] border border-[#e5e5ea] ${className}`}>
      {status || "Spec"}
    </span>
  );
}
