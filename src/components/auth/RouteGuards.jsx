import React from "react";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = ({ children, fallback = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-700/20 border-t-red-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-[#7b1113] flex items-center justify-center mb-4 text-2xl font-bold">
          🔒
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-[#111] mb-2">Authentication Required</h2>
        <p className="text-zinc-600 max-w-md mb-6">
          You need to sign into your Mars Multi account to access this protected customer portal.
        </p>
        <a
          href="/login"
          className="px-6 py-3 bg-[#7b1113] hover:bg-[#600d0f] text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 inline-block"
        >
          Sign In Now
        </a>
      </div>
    );
  }

  if (isAuthenticated && user && !user.is_verified) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4 text-2xl font-bold">
          ✉️
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-[#111] mb-2">Email Verification Required</h2>
        <p className="text-zinc-600 max-w-md mb-6">
          Your account is created but you need to verify your email address to access this area. Please check your inbox and click the verification link we sent you.
        </p>
      </div>
    );
  }

  return children;
};

export const AdminRoute = ({ children, fallback = null }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-700/20 border-t-red-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return fallback || (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-4 text-2xl font-bold">
          ⚠️
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-[#111] mb-2">403 Forbidden Access</h2>
        <p className="text-zinc-600 max-w-md mb-6">
          This secure domain requires Store Administrator privileges. Current operational clearance for account ({user?.email || "Guest"}): <span className="font-semibold text-red-700">{user?.role_name || "Unidentified"}</span>.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl shadow transition-transform hover:-translate-y-0.5 inline-block"
        >
          Return to Showroom
        </a>
      </div>
    );
  }

  return children;
};

export const RoleProtectedRoute = ({ allowedRoles = [], children, fallback = null }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-700/20 border-t-red-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || (!allowedRoles.includes(role) && role !== "Super Admin")) {
    return fallback || (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-700 flex items-center justify-center mb-4 text-2xl font-bold">
          🛡️
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-[#111] mb-2">Role Clearance Denied</h2>
        <p className="text-zinc-600 max-w-md mb-6">
          Your current account tier ({role}) does not possess authorization for this feature area.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl shadow inline-block"
        >
          Back to Home
        </a>
      </div>
    );
  }

  return children;
};
