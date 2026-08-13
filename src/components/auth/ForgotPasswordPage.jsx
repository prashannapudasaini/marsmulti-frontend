import React, { useState } from "react";
import { authService } from "../../services/authClient";

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not submit recovery request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#f8f9fa]">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-lg border border-zinc-200/80 relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#7b1113]" />

        {submitted ? (
          <div className="text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-[#111]">Recovery Link Sent</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              If an account matching <strong>{email}</strong> exists in our secure database, we have dispatched a password recovery link.
            </p>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs text-left">
              💡 <strong>Developer Mode:</strong> Check your Python backend terminal window to view and click the generated test recovery URL!
            </div>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate("login") : (window.location.href = "/login")}
              className="w-full py-3 bg-[#7b1113] text-white font-bold rounded-xl shadow transition duration-200"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-heading font-extrabold text-[#111]">Forgot Password?</h2>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-medium">
                Enter your account email below to receive a single-use secure reset link.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-800 text-xs font-bold border border-red-200">
                ⚠️ {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Account Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#7b1113] text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 text-white font-bold rounded-xl shadow transition duration-200 ${loading ? "bg-zinc-400 cursor-not-allowed" : "bg-[#7b1113] hover:bg-[#600d0f] shadow-red-900/20 active:scale-[0.98]"
                  }`}
              >
                {loading ? "Sending Request..." : "Send Reset Link"}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate("login") : (window.location.href = "/login")}
                className="text-xs font-bold text-zinc-500 hover:text-[#111]"
              >
                ← Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
