import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";
import { ToastProvider } from "../components/ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert, LogIn, Store, Loader2 } from "lucide-react";

export const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isAuthenticated, isStaff, isAdmin, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <p className="text-sm font-semibold tracking-wide text-slate-300 animate-pulse">
          Verifying administrative credentials...
        </p>
      </div>
    );
  }

  const isAuthorized = isAuthenticated && (isStaff || isAdmin || (user && [1, 2, 3, 4].includes(user.role_id)));

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 font-sans text-white">
        <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-inner">
            <ShieldAlert size={36} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Access Restricted
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              The Mars Multi Showroom Executive Dashboard requires verified staff or administrator security credentials. You are either not logged in or do not hold sufficient privileges.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/login"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <LogIn size={16} />
              <span>Staff Sign In</span>
            </a>
            <a
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
            >
              <Store size={16} />
              <span>Showroom Home</span>
            </a>
          </div>
          <div className="text-[10px] text-slate-500 pt-4 border-t border-slate-700/60 font-semibold tracking-wider uppercase">
            Mars Multi Security & Access Governance
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
        {/* Fixed Collapsible Sidebar */}
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Shell with appropriate left margin */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarCollapsed ? "sm:ml-20" : "sm:ml-64"
          }`}
        >
          <AdminNavbar
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};
