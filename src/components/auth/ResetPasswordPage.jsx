import React, { useState, useEffect } from "react";
import { authService } from "../../services/authClient";

export default function ResetPasswordPage({ onNavigate }) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Parse token from window location parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("No recovery token detected in website link. Please request a new recovery link.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password. The token may be expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#f8f9fa]">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-zinc-200/80 relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#7b1113]" />

        {success ? (
          <div className="text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-[#111]">Password Reset Complete!</h3>
            <p className="text-sm text-zinc-600">
              Your password has been updated securely and active sessions have been reset.
            </p>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate("login") : (window.location.href = "/login")}
              className="w-full py-3 bg-[#7b1113] hover:bg-[#600d0f] text-white font-bold rounded-xl shadow transition"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-heading font-extrabold text-[#111]">Set New Password</h2>
              <p className="mt-1 text-xs sm:text-sm text-zinc-500 font-medium">
                Choose a strong replacement password for your account.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200">
                ⚠️ {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-[#7b1113] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-[#7b1113] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className={`w-full py-3.5 text-white font-bold rounded-xl shadow transition ${
                  loading || !token ? "bg-zinc-400 cursor-not-allowed" : "bg-[#7b1113] hover:bg-[#600d0f]"
                }`}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
