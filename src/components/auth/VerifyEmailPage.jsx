import React, { useState, useEffect } from "react";
import { authService } from "../../services/authClient";

export default function VerifyEmailPage({ onNavigate }) {
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Validating security token...");

  useEffect(() => {
    const performVerification = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setStatus("error");
        setMessage("No email verification token provided in URL parameter.");
        return;
      }

      try {
        const res = await authService.verifyEmail(token);
        setStatus("success");
        setMessage(res.message || "Your email address has been verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.detail || "Verification link expired or already activated.");
      }
    };

    performVerification();
  }, []);

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 bg-[#f8f9fa]">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-zinc-200 text-center space-y-6">
        {status === "verifying" && (
          <>
            <div className="w-12 h-12 border-4 border-red-700/20 border-t-red-700 rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-heading font-bold text-[#111]">Verifying Email Account...</h3>
            <p className="text-zinc-500 text-sm">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-[#111]">Account Activated!</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">{message}</p>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate("login") : (window.location.href = "/login")}
              className="w-full py-3.5 bg-[#7b1113] hover:bg-[#600d0f] text-white font-bold rounded-xl shadow transition duration-200"
            >
              Sign In with Your Credentials
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-3xl font-bold">
              ✕
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-[#111]">Verification Notice</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">{message}</p>
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate("home") : (window.location.href = "/")}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl text-sm transition"
              >
                Go Home
              </button>
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate("login") : (window.location.href = "/login")}
                className="flex-1 py-3 bg-[#7b1113] hover:bg-[#600d0f] text-white font-bold rounded-xl text-sm shadow transition"
              >
                Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
