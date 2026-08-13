import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authClient";

export default function ProfilePage({ onNavigate }) {
  const { user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // overview, security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [loading, setLoading] = useState(false);
  const [securityMsg, setSecurityMsg] = useState({ type: "", text: "" });

  if (!user) return null;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSecurityMsg({ type: "", text: "" });

    if (newPassword !== confirmNew) {
      setSecurityMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      setSecurityMsg({ type: "success", text: res.message || "Password updated cleanly!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNew("");
    } catch (err) {
      setSecurityMsg({ type: "error", text: err.response?.data?.detail || "Failed to change password." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    if (onNavigate) {
      onNavigate("home");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header Badge */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-2.5 ${isAdmin ? "bg-amber-600" : "bg-[#7b1113]"}`} />
        
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-3xl font-heading font-extrabold shadow-md shrink-0 overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
          ) : (
            <span>{user.full_name?.charAt(0)?.toUpperCase() || "M"}</span>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#111]">{user.full_name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${
              isAdmin ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-red-50 text-[#7b1113] border border-red-200"
            }`}>
              {user.role_name} Tier
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              user.is_verified ? "bg-green-100 text-green-800" : "bg-amber-50 text-amber-700"
            }`}>
              {user.is_verified ? "✓ Verified Email" : "⏳ Pending Email Activation"}
            </span>
          </div>
          <p className="text-sm font-medium text-zinc-500">Email Address: <span className="text-zinc-800 font-bold">{user.email}</span></p>
          {user.phone && <p className="text-sm font-medium text-zinc-500">Phone: <span className="text-zinc-800">{user.phone}</span></p>}
          <p className="text-xs text-zinc-400 pt-1">Account Registered: {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
        </div>

        <button
          onClick={handleSignOut}
          className="self-center sm:self-start px-5 py-2.5 bg-zinc-100 hover:bg-red-50 hover:text-red-700 text-zinc-800 text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 shadow-sm"
        >
          🚪 Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 gap-6 text-sm font-extrabold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 border-b-2 transition-all ${activeTab === "overview" ? "border-[#7b1113] text-[#7b1113]" : "border-transparent text-zinc-400 hover:text-zinc-700"}`}
        >
          Account Overview
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 border-b-2 transition-all ${activeTab === "security" ? "border-[#7b1113] text-[#7b1113]" : "border-transparent text-zinc-400 hover:text-zinc-700"}`}
        >
          Security & Password
        </button>
      </div>

      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-[#111] flex items-center gap-2">
              <span>🛡️</span> Security & Permissions
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              You are signed in with a <strong>{user.role_name}</strong> authorization clearance. Your access tokens rotate automatically every 15 minutes to guarantee session integrity.
            </p>
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-700 space-y-2 font-medium">
              <div className="flex justify-between">
                <span className="text-zinc-400">Account Status:</span>
                <span className="text-green-700 font-bold">Active & Secure</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Token Strategy:</span>
                <span>JWT + Automatic Rotation</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-[#111] flex items-center gap-2">
              <span>📦</span> Order History (Quick View)
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600">
              Orders placed under <strong>{user.email}</strong> will be synchronized with our warehouse Cash on Delivery (COD) dispatch system.
            </p>
            <button
              onClick={() => onNavigate ? onNavigate("home") : (window.location.href = "/")}
              className="mt-2 text-xs font-extrabold uppercase tracking-wider text-[#7b1113] hover:underline block"
            >
              Browse Electronics Showroom →
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-heading font-extrabold text-[#111]">Change Account Password</h3>
            <p className="text-xs text-zinc-500 mt-1">Updating your password will automatically sign out all other active device sessions.</p>
          </div>

          {securityMsg.text && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
              securityMsg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {securityMsg.text}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div>
              <label className="block text-xs font-extrabold uppercase text-zinc-600 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-[#7b1113] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-zinc-600 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-[#7b1113] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-zinc-600 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmNew}
                onChange={(e) => setConfirmNew(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-[#7b1113] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#7b1113] hover:bg-[#600d0f] text-white font-bold rounded-xl shadow transition text-sm"
            >
              {loading ? "Updating..." : "Save New Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
