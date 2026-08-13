import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage({ onNavigate }) {
  const { login, googleLogin, logout, error: authError, clearError } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const staffRoles = ["Super Admin", "Admin", "Inventory Manager", "Sales Manager"];
      const isStaff = staffRoles.includes(res.user?.role_name);

      if (isAdminMode) {
        if (!isStaff) {
          await logout();
          setErrorMessage("Access denied. Admin portal is restricted to authorized personnel.");
          return;
        }
        window.location.href = "/admin/dashboard";
        return;
      } else {
        if (isStaff) {
          await logout();
          setErrorMessage("Administrators must use the Admin Portal to sign in.");
          return;
        }
        if (onNavigate) {
          onNavigate("home");
        } else {
          window.location.href = "/";
        }
      }
    } else {
      setErrorMessage(res.message || "Login failed. Please verify credentials.");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");
    // Using simulated OAuth credentials for instantaneous developer testing
    const simulatedToken = "simulated_google_token_shopper";
    const res = await googleLogin(simulatedToken);
    setLoading(false);

    if (res.success) {
      if (onNavigate) {
        onNavigate("home");
      } else {
        window.location.href = "/";
      }
    } else {
      setErrorMessage(res.message || "Google OAuth authentication unsuccessful.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8f9fa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] border border-zinc-200/80 relative overflow-hidden">
        {/* Decorative accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-2 transition-colors duration-300 ${isAdminMode ? "bg-amber-600" : "bg-[#7b1113]"}`} />

        {/* Mode switcher tabs */}
        <div className="flex rounded-xl bg-zinc-100 p-1 mb-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setIsAdminMode(false); setErrorMessage(""); }}
            className={`flex-1 py-2 text-center rounded-lg transition-all duration-200 ${!isAdminMode ? "bg-white text-[#111] shadow-sm font-bold" : "text-zinc-500 hover:text-zinc-800"}`}
          >
            👤 Customer Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsAdminMode(true); setErrorMessage(""); }}
            className={`flex-1 py-2 text-center rounded-lg transition-all duration-200 ${isAdminMode ? "bg-amber-600 text-white shadow-sm font-bold" : "text-zinc-500 hover:text-zinc-800"}`}
          >
            🛡️ Admin Portal
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111] tracking-tight">
            {isAdminMode ? "Store Administrator Login" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-medium">
            {isAdminMode ? (
              <span>
                Enter your administrative credentials.
              </span>
            ) : (
              "Sign in to check orders, track warranties, and manage your profile."
            )}
          </p>
        </div>

        {(errorMessage || authError) && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3 animate-pulse">
            <span className="text-base leading-none">⚠️</span>
            <div className="font-semibold flex-1">{errorMessage || authError}</div>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-600 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAdminMode ? "admin@marsmulti.com.np" : "name@example.com"}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:border-transparent text-sm font-medium transition duration-150"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-600">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate("forgot-password") : (window.location.href = "/forgot-password")}
                className="text-xs font-bold text-[#7b1113] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:border-transparent text-sm font-medium transition duration-150"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 text-white font-bold rounded-xl shadow-lg transition duration-200 transform active:scale-[0.98] flex items-center justify-center gap-2 ${
              loading ? "opacity-70 cursor-not-allowed bg-zinc-500" : isAdminMode ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30" : "bg-[#7b1113] hover:bg-[#600d0f] shadow-red-900/20"
            }`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>{isAdminMode ? "Unlock Admin Governance" : "Sign In"}</span>
            )}
          </button>
        </form>

        {!isAdminMode && (
          <div className="mt-6 space-y-6">

            <p className="text-center text-xs text-zinc-500 font-medium pt-2 border-t border-zinc-100">
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate("register") : (window.location.href = "/register")}
                className="text-[#7b1113] font-bold hover:underline"
              >
                Create an Account
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
