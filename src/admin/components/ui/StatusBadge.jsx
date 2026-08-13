import React from "react";

export const StatusBadge = ({ status, size = "md" }) => {
  if (!status) return null;
  const normalized = status.toString().toLowerCase().replace(" ", "_");

  const colors = {
    // Publish states
    published: "bg-emerald-100 text-emerald-800 border-emerald-300",
    draft: "bg-amber-100 text-amber-800 border-amber-300",
    archived: "bg-slate-100 text-slate-700 border-slate-300",

    // Order states
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    pending_call_verification: "bg-amber-100 text-amber-800 border-amber-300",
    confirmed: "bg-blue-100 text-blue-800 border-blue-300",
    processing: "bg-purple-100 text-purple-800 border-purple-300",
    packed: "bg-indigo-100 text-indigo-800 border-indigo-300",
    shipped: "bg-cyan-100 text-cyan-800 border-cyan-300",
    delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
    cancelled: "bg-rose-100 text-rose-800 border-rose-300",

    // Stock states
    in_stock: "bg-emerald-100 text-emerald-800 border-emerald-300",
    low_stock: "bg-amber-100 text-amber-800 border-amber-300",
    out_of_stock: "bg-rose-100 text-rose-800 border-rose-300",
  };

  const badgeColor = colors[normalized] || "bg-slate-100 text-slate-700 border-slate-300";
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs ${badgeColor} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      <span className="capitalize">{status.toString().replace(/_/g, " ")}</span>
    </span>
  );
};
