import React, { useState } from "react";
import { ShieldCheck, Zap, MapPin, Phone, MessageCircle, Mail, Send, CheckCircle, Clock, Award } from "lucide-react";
import { useUrlParams } from "../../hooks/useUrlParams";
import { CONFIG } from "../../constants/config";
import { SHOWROOM_CATEGORIES } from "../../constants/categories";
import { scrollToTop } from "./LenisScrollProvider";

export function Footer({ onNavigate }) {
  const { updateParams } = useUrlParams();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const navigateToCategory = (slug) => {
    updateParams({ category: slug });
    scrollToTop(false);
  };

  const openWhatsAppSupport = () => {
    const number = (CONFIG.WHATSAPP_SUPPORT_NUMBER || "+9779800000000").replace("+", "");
    window.open(`https://wa.me/${number}?text=Hello%20Mars%20Multi%20team!%20I%20have%20an%20inquiry%20regarding%20hardware%20and%20COD%20delivery.`, "_blank");
  };

  return (
    <footer className="w-full bg-gradient-to-r from-[#1a0304] via-[#47070a] to-[#7b1113] text-slate-300 border-t-2 border-[#7b1113] mt-auto">
      {/* Main Footer Directory Columns */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Column 1 & 2: Brand Information */}
        <div className="lg:col-span-2 space-y-5 pr-4">
          <div
            className="flex items-center gap-3.5 cursor-pointer group select-none self-start"
            onClick={() => {
              if (onNavigate) {
                onNavigate("home");
              } else if (window.location.pathname === "/" && !window.location.search && window.scrollY === 0) {
                window.location.reload();
              } else {
                window.location.href = "/";
              }
            }}
          >
            <img
              src="/logo.png"
              alt="Mars Multi Logo"
              className="h-18 sm:h-20 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
            />
            <span className="w-[2px] h-11 bg-[#d97706] rounded-full opacity-80" />
            <div>
              <div className="font-heading text-2xl sm:text-3xl font-black tracking-tight leading-none bg-gradient-to-r from-[#e53238] via-[#e85b2e] to-[#f59e0b] bg-clip-text text-transparent flex items-center">
                Mars <span className="ml-1.5">Multi</span>
              </div>
              <p className="text-xs text-slate-400 font-semibold tracking-tight leading-none mt-1">
                {CONFIG.SITE_TAGLINE || "Tech that powers your world"}
              </p>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-300 leading-relaxed max-w-md">
            Mars Multi is Nepal's premier digital showroom and hardware dispatch terminal. We supply authentic gaming workstations, displays, CCTV solutions, and enterprise computing components directly to your doorstep.
          </p>

          <div className="space-y-2.5 text-xs font-bold text-slate-300 pt-2">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-amber-400 shrink-0" />
              <span>Newroad, Kathmandu, Nepal</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-amber-400 shrink-0" />
              <span>984-9025283</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-amber-400 shrink-0" />
              <span>info@marsmulti.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-amber-400 shrink-0" />
              <span>Sunday – Friday: 10:00 AM to 7:00 PM NPT</span>
            </div>
          </div>
        </div>

        {/* Column 3: Hardware Departments */}
        <div className="space-y-4">
          <h3 className="text-base font-heading font-black uppercase tracking-wider text-white border-b border-white/10 pb-2.5">
            Hardware Depts
          </h3>
          <ul className="space-y-2 text-xs font-extrabold text-slate-300">
            {SHOWROOM_CATEGORIES.slice(0, 7).map((cat) => (
              <li key={cat.slug}>
                <button
                  onClick={() => navigateToCategory(cat.slug)}
                  className="hover:text-amber-400 hover:translate-x-1 transition-all duration-200 block cursor-pointer py-1"
                >
                  ► {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: More Categories & Build PC */}
        <div className="space-y-4">
          <h3 className="text-base font-heading font-black uppercase tracking-wider text-white border-b border-white/10 pb-2.5">
            Components & Parts
          </h3>
          <ul className="space-y-2 text-xs font-extrabold text-slate-300">
            {SHOWROOM_CATEGORIES.slice(7).map((cat) => (
              <li key={cat.slug}>
                <button
                  onClick={() => navigateToCategory(cat.slug)}
                  className="hover:text-amber-400 hover:translate-x-1 transition-all duration-200 block cursor-pointer py-1"
                >
                  ► {cat.name}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => navigateToCategory("desktop-parts")}
                className="text-amber-400 hover:text-amber-300 hover:translate-x-1 transition-all duration-200 block cursor-pointer py-1 font-black"
              >
                ⚡ Custom PC Build Engine
              </button>
            </li>
          </ul>
        </div>

        {/* Column 5: Newsletter & Deal Alerts */}
        <div className="space-y-4">
          <h3 className="text-base font-heading font-black uppercase tracking-wider text-white border-b border-white/10 pb-2.5">
            Real-Time Price Drops
          </h3>
          <p className="text-xs font-medium text-slate-300 leading-relaxed">
            Subscribe to receive instant SMS and email notifications when GPU and flagship laptop prices drop in Nepal.
          </p>

          {subscribed ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle size={16} /> Subscribed to warehouse alerts!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#7b1113] hover:bg-amber-500 text-white hover:text-[#1d1d1f] transition-colors flex items-center justify-center font-bold cursor-pointer"
                  title="Subscribe"
                >
                  <Send size={14} />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block">We respect your privacy. No marketing spam.</span>
            </form>
          )}

          <div className="pt-2">
            <button
              onClick={openWhatsAppSupport}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <MessageCircle size={17} className="fill-current" />
              <span>Chat on WhatsApp</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Legal & Payment Options Bar */}
      <div className="border-t border-white/15 bg-black/30 backdrop-blur-sm py-6 text-xs text-slate-300 font-medium">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="font-extrabold text-slate-400">
            © {new Date().getFullYear()} <span className="font-black bg-gradient-to-r from-[#e53238] to-[#f59e0b] bg-clip-text text-transparent">Mars Multi</span>. Authorised Nepal Showroom & COD Terminal. All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] font-bold text-slate-300">
            <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15">💵 Cash on Delivery</span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-emerald-400">🟢 eSewa Verified</span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-purple-400">🟣 Khalti Ready</span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-blue-400">🏦 ConnectIPS / Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
