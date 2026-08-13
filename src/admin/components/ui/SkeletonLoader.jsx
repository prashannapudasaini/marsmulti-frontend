import React from "react";

export const SkeletonLoader = ({ rows = 5, columns = 4, className = "" }) => {
  return (
    <div className={`w-full animate-pulse bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs ${className}`}>
      <div className="h-6 w-48 bg-slate-200 rounded-lg mb-6" />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={cIdx}
                className={`h-10 bg-slate-100 rounded-xl ${
                  cIdx === 0 ? "w-1/3" : "w-1/5 flex-1"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
