import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingBag, MapPin, ChevronDown, Heart, Sparkles, Mic, X, User } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useUrlParams } from "../../hooks/useUrlParams";
import { useCategories } from "../../hooks/useProducts";
import { useAuth } from "../../context/AuthContext";
import { formatNPR } from "../../utils/currency";
import { CONFIG } from "../../constants/config";

export function Navbar({ onSearchChange, onNavigate }) {
  const { totalItems, totalPrice, setIsCartOpen } = useCart();
  const { updateParams } = useUrlParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { data: backendCategories } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const searchContainerRef = useRef(null);
  const lastScrollY = useRef(0);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsCategoriesExpanded(false);
  };

  const onSearchChangeRef = useRef(onSearchChange);

  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChangeRef.current) {
        onSearchChangeRef.current(searchTerm);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Add a small threshold (5px) so it doesn't flicker on tiny scroll bounces
      if (currentScrollY > lastScroll + 5 && currentScrollY > 100) {
        setIsVisible(false);
        lastScroll = currentScrollY;
      } else if (currentScrollY < lastScroll - 5) {
        setIsVisible(true);
        lastScroll = currentScrollY;
      }
    };

    // Native scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Lenis smooth scroll listener (if active)
    if (window.lenis) {
      window.lenis.on('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (window.lenis) {
        window.lenis.off('scroll', handleScroll);
      }
    };
  }, []);


  return (
    <header className={`sticky top-0 z-40 w-full bg-white border-b border-[#e5e5ea] shadow-xs transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 min-h-24 py-2 flex items-center justify-between gap-3 sm:gap-8">

        {/* Mobile Hamburger Toggler */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex lg:hidden p-2 -ml-2 text-slate-700 hover:text-[#7b1113]"
          aria-label="Open Mobile Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        {/* Left: Taller Brand Logo & Typography with Zero Outer Side Margins */}
        <div
          className="flex items-center gap-3 sm:gap-4 cursor-pointer group shrink-0 select-none"
          onClick={() => {
            setSearchTerm("");
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
            className="h-18 sm:h-20 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform drop-shadow-xs"
          />
          <span className="w-[2px] h-9 bg-[#d97706] rounded-full hidden sm:block opacity-80" />
          <div>
            <div className="font-heading text-2xl sm:text-3xl font-black tracking-tight leading-none bg-gradient-to-r from-[#7b1113] via-[#ba2d30] to-[#f59e0b] bg-clip-text text-transparent flex items-center">
              Mars <span className="ml-1.5">Multi</span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-semibold tracking-tight leading-none mt-1">
              {CONFIG.SITE_TAGLINE || "Tech that powers your world"}
            </p>
          </div>
        </div>

        {/* Center: Wide Rounded Search Input Bar */}
        <div className="flex-1 max-w-2xl relative hidden lg:block" ref={searchContainerRef}>
          <div className={`relative flex items-center rounded-full border px-5 py-2 transition-all duration-200 ${isSearchFocused
            ? "bg-white border-[#7b1113] ring-4 ring-[#7b1113]/15 shadow-md"
            : "bg-[#f5f5f7] border-[#e5e5ea] hover:bg-white hover:border-slate-300 shadow-inner"
            }`}>
            <Search className="mr-3 text-slate-400 shrink-0 group-focus-within:text-[#7b1113]" size={20} />
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent pr-3 py-1 text-sm font-semibold text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="p-1 text-slate-400 hover:text-[#1d1d1f] transition-colors mr-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

        </div>

        {/* Right: Location, Currency, Wishlist, User & Cart Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">

          {/* Location Selector Pill */}
          <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#e5e5ea] bg-[#f8f2f2]/60 hover:bg-white transition-colors cursor-pointer shadow-xs">
            <MapPin size={19} className="text-slate-400 shrink-0" />
            <div className="text-left leading-tight">
              <div className="flex items-center gap-1 font-bold text-xs text-[#1d1d1f]">
                Kathmandu, Nepal <ChevronDown size={14} className="text-slate-400" />
              </div>
              <div className="text-[10px] font-extrabold text-emerald-600 mt-0.5">
                Fast delivery in 24-48h
              </div>
            </div>
          </div>

          {/* Wishlist Circle Button */}
          <button
            onClick={() => { }}
            className="hidden sm:flex w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#e5e5ea] bg-[#f8f2f2]/60 hover:bg-rose-50 hover:border-rose-200 items-center justify-center text-slate-600 hover:text-rose-500 shadow-xs relative transition-all cursor-pointer shrink-0"
            title="Saved Items"
          >
            <Heart size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
              3
            </span>
          </button>

          {/* Admin Switcher Badge for Authorized Accounts */}
          {isAuthenticated && (isAdmin || (user && [1, 2, 3, 4].includes(user.role_id))) && (
            <a
              href="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs shadow-md transition-all border border-amber-400/30 hover:scale-105 shrink-0"
              title="Launch Executive Admin Console"
            >
              <Sparkles size={14} className="text-amber-400 animate-pulse shrink-0" />
              <span>Admin Console</span>
            </a>
          )}

          {/* Authentication & Profile Pill Button */}
          <div className="hidden sm:block">
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate ? onNavigate("profile") : (window.location.href = "/profile")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 shadow-xs cursor-pointer shrink-0 transition-colors"
                title="View Account Profile & Security"
              >
                <div className={`w-8 h-8 rounded-full ${isAdmin ? "bg-amber-600" : "bg-[#7b1113]"} text-white font-black text-xs flex items-center justify-center shadow-inner`}>
                  {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block text-left text-xs pr-1">
                  <div className="font-bold leading-none truncate max-w-[80px]">{user.full_name?.split(" ")[0]}</div>
                  <div className="text-[9px] font-black text-amber-700 uppercase tracking-wide mt-0.5">{isAdmin ? "Admin" : "Member"}</div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => onNavigate ? onNavigate("login") : (window.location.href = "/login")}
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#7b1113] text-[#7b1113] font-bold text-xs hover:bg-[#7b1113] hover:text-white shadow-xs cursor-pointer shrink-0 transition-all"
              >
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Primary Cart Icon-Only Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full !bg-[#7b1113] hover:!bg-[#5e0c0e] text-white shadow-md hover:shadow-lg flex items-center justify-center relative transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0 group"
            title="View Cart"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag size={22} className="text-white shrink-0 group-hover:rotate-6 transition-transform" />
            {totalItems > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-400 border-2 border-[#7b1113] text-[#1d1d1f] font-black text-[10px] flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white" />
            )}
          </button>

        </div>
      </div>

      {/* Mobile Menu Toggler Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-slideInLeft">
            <div className="p-4 flex items-center justify-between border-b border-[#e5e5ea]">
              <div className="font-heading text-xl font-black text-[#7b1113]">Menu</div>
              <button
                onClick={closeMobileMenu}
                className="p-2 bg-slate-100 rounded-full text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-6">
              {/* Mobile Search */}
              <div className="relative flex items-center rounded-full border border-slate-300 px-4 py-2 bg-[#f5f5f7]">
                <Search className="mr-2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent text-sm font-semibold text-[#1d1d1f] focus:outline-none"
                />
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-4">
                <button onClick={() => { onNavigate && onNavigate("home"); closeMobileMenu(); }} className="block font-bold text-slate-800 text-lg w-full text-left hover:text-[#7b1113]">Home</button>

                {/* Categories Accordion */}
                <div>
                  <button
                    onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                    className="flex items-center justify-between font-bold text-slate-800 text-lg w-full text-left hover:text-[#7b1113]"
                  >
                    <span>All Categories</span>
                    <ChevronDown size={20} className={`transform transition-transform duration-200 ${isCategoriesExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isCategoriesExpanded && backendCategories && (
                    <div className="pl-4 mt-3 space-y-3 border-l-2 border-[#e5e5ea] ml-2 animate-fadeIn">
                      {backendCategories.map(cat => (
                        <button
                          key={cat.slug}
                          onClick={() => {
                            if (onNavigate) onNavigate("home");
                            updateParams({ category: cat.slug, search: "", product: "" });
                            closeMobileMenu();
                          }}
                          className="block font-semibold text-slate-600 text-base w-full text-left hover:text-[#7b1113]"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => { setIsCartOpen(true); closeMobileMenu(); }} className="block font-bold text-slate-800 text-lg w-full text-left hover:text-[#7b1113]">Shopping Cart</button>
                <button className="block font-bold text-slate-800 text-lg w-full text-left hover:text-[#7b1113]">Saved Wishlist</button>
              </div>

              <hr className="border-[#e5e5ea]" />

              {/* Mobile Auth / Profile */}
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7b1113] text-white flex items-center justify-center font-bold">
                      {user.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{user.full_name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { onNavigate && onNavigate("profile"); closeMobileMenu(); }}
                    className="w-full py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 text-sm hover:bg-slate-50"
                  >
                    Manage Account
                  </button>
                  {isAdmin && (
                    <a href="/admin/dashboard" className="block w-full text-center py-2.5 rounded-xl bg-slate-900 text-amber-400 font-bold text-sm hover:bg-slate-800">
                      Admin Console
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => { onNavigate && onNavigate("login"); closeMobileMenu(); }}
                    className="w-full py-3 rounded-xl bg-[#7b1113] text-white font-bold text-sm hover:bg-[#5e0c0e]"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { onNavigate && onNavigate("register"); closeMobileMenu(); }}
                    className="w-full py-3 rounded-xl border-2 border-[#7b1113] text-[#7b1113] font-bold text-sm hover:bg-slate-50"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
