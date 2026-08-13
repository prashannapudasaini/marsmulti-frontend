import React from "react";
import { FolderOpen, Plus } from "lucide-react";

export const EmptyState = ({ title = "No items found", description = "Get started by creating your first record.", actionLabel, onAction, icon: Icon = FolderOpen }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-2xs my-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200 text-slate-500">
        <Icon className="w-8 h-8 stroke-1" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
