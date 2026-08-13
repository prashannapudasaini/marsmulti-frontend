import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to proceed? This action cannot be undone.", confirmLabel = "Delete", variant = "danger", isLoading = false }) => {
  if (!isOpen) return null;

  const buttonStyle = variant === "danger"
    ? "bg-rose-600 hover:bg-rose-700 text-white"
    : "bg-slate-900 hover:bg-slate-800 text-white";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden relative"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${variant === "danger" ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"}`}>
                <AlertTriangle className="w-6 h-6 stroke-2" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              disabled={isLoading}
              className={`px-5 py-2 text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-2 ${buttonStyle}`}
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
