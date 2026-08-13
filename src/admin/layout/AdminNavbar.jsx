import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, User, LogOut, Menu, X, ChevronDown, Store, Shield, CheckCircle } from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export const AdminNavbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { authState, logout } = useAuth();

  useEffect(() => {
    // Fetch notifications summary
    const fetchNotifs = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/admin/notifications", {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        if (res.data) setNotifications(res.data.slice(0, 5));
      } catch (err) {
        setNotifications([]);
      }
    };
    fetchNotifs();
  }, [authState.token]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        setIsSearchOpen(false);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/admin/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setSearchResults(res.data.results || []);
        setIsSearchOpen(true);
      } catch (err) {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, authState.token]);

  const getRoleName = (role_name) => { return role_name || "Staff"; };
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSelectResult = (link) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    navigate(link);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 sm:hidden focus:outline-hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search Switcher */}
        <div className="relative w-48 md:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setIsSearchOpen(true); }}
              placeholder="Quick search orders, SKUs..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-100 hover:bg-slate-200/60 focus:bg-white text-slate-800 rounded-xl text-xs font-medium border border-transparent focus:border-slate-300 focus:ring-2 focus:ring-slate-900 transition"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 p-2 space-y-1 max-h-80 overflow-y-auto">
              <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Universal Results ({searchResults.length})</div>
              {searchResults.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectResult(res.link)}
                  className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition flex flex-col gap-0.5 border border-transparent hover:border-slate-200/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{res.title}</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{res.type}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate">{res.subtitle}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Center */}
        <div className="relative">
          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-700" />
                  Notifications Center
                </h4>
                <span className="text-xs font-semibold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">{unreadCount} new</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">All caught up! No notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-3.5 hover:bg-slate-50 transition ${!n.is_read ? "bg-amber-50/30" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.created_at || "New"}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
                <Link to="/admin/notifications" onClick={() => setIsNotifOpen(false)} className="text-xs font-bold text-slate-900 hover:underline">
                  View all notifications & settings &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Direct Storefront Switcher */}
        <a
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-amber-400 hover:bg-slate-800 transition text-xs font-bold shadow-xs border border-amber-400/30 shrink-0"
          title="Return to Customer Showroom"
        >
          <Store className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Live Store</span>
        </a>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-hidden border border-slate-200/60"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
              {authState?.user?.full_name ? authState.user.full_name[0].toUpperCase() : "A"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                {authState?.user?.full_name || getRoleName(authState?.user?.role_name)}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Authorized
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 space-y-1">
              <div className="p-2.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{authState?.user?.email || "admin@marsmulti.com.np"}</p>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Role: {getRoleName(authState?.user?.role_name)}</span>
              </div>
              <Link
                to="/admin/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-medium text-slate-700 transition"
              >
                <Shield className="w-4 h-4 text-slate-500" />
                System Settings & Security
              </Link>
              <a
                href="/"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-medium text-slate-700 transition"
              >
                <Store className="w-4 h-4 text-slate-500" />
                Go to Customer Showroom
              </a>
              <button
                onClick={() => { logout(); window.location.href = "/"; }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-xs font-semibold text-rose-600 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign out of Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
