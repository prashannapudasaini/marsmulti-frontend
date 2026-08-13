import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage({ onNavigate }) {
  const { register, error: authError, clearError } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Real-time password strength validation flags
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const isStrong = hasMinLen && hasUpper && hasLower && hasDigit && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setErrorMessage("");

    if (!isStrong) {
      setErrorMessage("Please ensure your password satisfies all security criteria listed below.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please retype carefully.");
      return;
    }

    setLoading(true);
    const res = await register({ full_name: fullName, email, phone, password });
    setLoading(false);

    if (res.success) {
      setSuccessMessage("Registration successful! Please check your email to activate your account.");
    } else {
      setErrorMessage(res.message || "Registration encountered an error.");
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#f8f9fa]">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-zinc-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto text-3xl font-bold">
            🎉
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-[#111]">Account Created!</h2>
          <p className="text-sm text-zinc-600 leading-relaxed">{successMessage}</p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold text-left">
            ✉️ <strong>Action Required:</strong> We've sent a verification link to your email address. Please click it to activate your account before signing in.
          </div>
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate("login") : (window.location.href = "/login")}
            className="w-full py-3 bg-[#7b1113] hover:bg-[#600d0f] text-white font-bold rounded-xl shadow transition duration-200"
          >
            Proceed to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8f9fa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] border border-zinc-200/80 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#7b1113]" />

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111] tracking-tight">
            Create Customer Account
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-medium">
            Register to experience ultra-fast checkout, real-time tracking & exclusive hardware deals.
          </p>
        </div>

        {(errorMessage || authError) && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold">
            ⚠️ {errorMessage || authError}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Prashant Gurung"
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#7b1113] text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#7b1113] text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+977-9800000000"
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#7b1113] text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
              Create Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#7b1113] text-sm font-medium"
            />
          </div>

          {/* Real-time password strength meter */}
          {password.length > 0 && (
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5 text-xs">
              <div className="font-extrabold uppercase text-[10px] text-zinc-500 mb-1">Password Strength Checklist:</div>
              <div className={`flex items-center gap-2 font-medium ${hasMinLen ? "text-green-600 font-bold" : "text-zinc-400"}`}>
                <span>{hasMinLen ? "✓" : "○"}</span> At least 8 characters long
              </div>
              <div className={`flex items-center gap-2 font-medium ${hasUpper ? "text-green-600 font-bold" : "text-zinc-400"}`}>
                <span>{hasUpper ? "✓" : "○"}</span> Contains an uppercase letter (A-Z)
              </div>
              <div className={`flex items-center gap-2 font-medium ${hasLower ? "text-green-600 font-bold" : "text-zinc-400"}`}>
                <span>{hasLower ? "✓" : "○"}</span> Contains a lowercase letter (a-z)
              </div>
              <div className={`flex items-center gap-2 font-medium ${hasDigit ? "text-green-600 font-bold" : "text-zinc-400"}`}>
                <span>{hasDigit ? "✓" : "○"}</span> Contains a numerical digit (0-9)
              </div>
              <div className={`flex items-center gap-2 font-medium ${hasSpecial ? "text-green-600 font-bold" : "text-zinc-400"}`}>
                <span>{hasSpecial ? "✓" : "○"}</span> Contains special symbol (@$!%*?&)
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-600 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#7b1113] text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isStrong}
            className={`w-full py-3.5 px-4 text-white font-bold rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 ${
              loading || !isStrong ? "opacity-60 cursor-not-allowed bg-zinc-400" : "bg-[#7b1113] hover:bg-[#600d0f] shadow-red-900/20 active:scale-[0.98]"
            }`}
          >
            {loading ? <span>Creating Account...</span> : <span>Register Account</span>}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 font-medium pt-3 border-t border-zinc-100">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate("login") : (window.location.href = "/login")}
            className="text-[#7b1113] font-bold hover:underline"
          >
            Sign In Here
          </button>
        </p>
      </div>
    </div>
  );
}
