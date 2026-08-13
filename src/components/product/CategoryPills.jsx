import React, { useState, useRef, useEffect } from "react";
import { useCategories } from "../../hooks/useProducts";
import { SORT_OPTIONS, SHOWROOM_CATEGORIES } from "../../constants/categories";
import { scrollToTop } from "../layout/LenisScrollProvider";
import { 
  Monitor, Laptop, Printer, Video, Wind, Presentation, 
  Tv, ScreenShare, Cpu, Battery, Zap, Settings, 
  SlidersHorizontal, ChevronDown, Check, Layers, Menu, Sparkles, X, ArrowRight
} from "lucide-react";

export function CategoryPills({ activeCategory, onSelectCategory, activeSort, onSelectSort }) {
  const { data: backendCategories } = useCategories();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case "desktop": return <Monitor size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      case "laptop": return <Laptop size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      case "printer": return <Printer size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      case "cctv": return <Video size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      case "ac": return <Wind size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      case "smartboard": return <Presentation size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      case "tv": return <Tv size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      case "monitor": return <ScreenShare size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      case "desktop-parts": return <Cpu size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      case "laptop-parts": return <Battery size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      case "electronic-electrical-parts": return <Zap size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      case "printer-parts": return <Settings size={16} className="shrink-0 text-[#f59e0b] group-hover:text-amber-300 transition-colors" />;
      default: return <Layers size={16} className="shrink-0 text-[#f59e0b]" />;
    }
  };

  const getCategoryImage = (slug) => {
    switch (slug) {
      case "desktop": return "/category-images/monitors.png";
      case "laptop": return "/category-images/laptops.png";
      case "printer": return "/category-images/printers.png";
      case "cctv": return "/category-images/smarthome.png";
      case "ac": return "/category-images/smarthome.png";
      case "smartboard": return "/category-images/tablets.png";
      case "tv": return "/category-images/audio.png";
      case "monitor": return "/category-images/monitors.png";
      case "desktop-parts": return "/category-images/components.png";
      case "laptop-parts": return "/category-images/accessories.png";
      case "electronic-electrical-parts": return "/category-images/smartwatches.png";
      case "printer-parts": return "/category-images/printers.png";
      default: return "/category-images/accessories.png";
    }
  };

  const displayCategories = (backendCategories && backendCategories.length > 0) 
    ? backendCategories 
    : SHOWROOM_CATEGORIES;

  const handleCategoryClick = (slug) => {
    onSelectCategory(slug);
    setIsCatDropdownOpen(false);
    scrollToTop(false);
  };

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

    window.addEventListener("scroll", handleScroll, { passive: true });
    
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
    <nav className={`w-full bg-gradient-to-r from-[#1a0304] via-[#47070a] to-[#7b1113] text-white border-b border-[#7b1113] shadow-md sticky top-22 sm:top-24 z-30 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-[150px]'}`} ref={dropdownRef}>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-2 relative">
        
        {/* Horizontal Category Strip with Zero Outer Margin */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar flex-1 py-1">
          
          {/* All Categories Trigger Button (Opens Dropdown UI instead of redirecting home) */}
          <button
            onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
            className={`inline-flex items-center gap-2 whitespace-nowrap pl-3.5 pr-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none shrink-0 min-w-max ${
              isCatDropdownOpen
                ? "bg-[#2d0506] text-amber-300 shadow-md ring-1 ring-amber-400/60"
                : "bg-white/10 text-white hover:bg-white/20 shadow-sm border border-white/15"
            }`}
          >
            <Menu size={16} className="text-amber-400 shrink-0" />
            <span className="hidden sm:inline">All Categories</span>
            <span className="sm:hidden">Categories</span>
            <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${isCatDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Special Benchmark Feature: Custom PC Build Button */}
          <button
            onClick={() => handleCategoryClick("desktop-parts")}
            className="inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#d97706] hover:from-amber-400 hover:to-amber-500 text-[#1d1d1f] font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer select-none shrink-0"
          >
            <Sparkles size={15} className="text-[#1d1d1f] fill-current" />
            <span>Build Your PC</span>
            <span className="bg-[#7b1113] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md ml-1 shadow-xs">
              NEW
            </span>
          </button>

          <span className="h-5 w-[1px] bg-white/20 shrink-0 hidden sm:block" />

          {/* Render 12 Categories */}
          {displayCategories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer select-none group shrink-0 ${
                  isActive
                    ? "bg-[#2d0506] text-amber-300 shadow-md ring-1 ring-amber-400/60 font-black"
                    : "text-slate-100 hover:text-white hover:bg-white/15"
                }`}
              >
                {getCategoryIcon(cat.slug)}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Trailing "View All / Sort" Dropdown Control */}
        <div className="relative shrink-0 border-l border-white/20 pl-4">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 text-amber-400 font-bold hover:text-amber-300 transition-colors cursor-pointer select-none"
          >
            <SlidersHorizontal size={18} /> 
            <span className="hidden sm:inline">Sort Catalog</span>
            <span className="sm:hidden">Sort</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Sort Menu Dropdown */}
          {isSortOpen && (
            <div 
              className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#e5e5ea] rounded-2xl shadow-xl py-2 z-50 animate-fadeIn text-left text-[#1d1d1f]"
              onMouseLeave={() => setIsSortOpen(false)}
            >
              <div className="px-4 py-1.5 text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider border-b border-[#e5e5ea] mb-1">
                Sort Showroom Hardware
              </div>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = activeSort === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSelectSort(opt.value);
                      setIsSortOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-xs font-extrabold text-[#1d1d1f] hover:bg-[#f5f5f7] hover:text-[#7b1113] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={16} className="text-[#7b1113]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* All Categories High-End Dropdown UI */}
        {isCatDropdownOpen && (
          <div className="absolute left-4 sm:left-6 top-full mt-2 w-[92vw] max-w-4xl bg-white border border-[#e5e5ea] rounded-3xl shadow-2xl p-6 z-50 animate-fadeIn text-[#1d1d1f]">
            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[#e5e5ea]/80">
              <div>
                <h3 className="text-base sm:text-lg font-heading font-black tracking-tight bg-gradient-to-r from-[#7b1113] via-[#9e2023] to-[#d97706] bg-clip-text text-transparent">
                  Explore Hardware Departments
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Select a category to navigate to dedicated warehouse inventories and COD options
                </p>
              </div>
              <button 
                onClick={() => setIsCatDropdownOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 max-h-[65vh] overflow-y-auto pr-1">
              {displayCategories.map((cat) => {
                const isCatActive = activeCategory === cat.slug;
                return (
                  <button
                    key={cat.id || cat.slug}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-left group ${
                      isCatActive
                        ? "bg-[#7b1113]/10 border-[#7b1113] ring-1 ring-[#7b1113]"
                        : "bg-[#f8f9fa] border-slate-200/80 hover:bg-white hover:border-[#7b1113]/40 hover:shadow-md"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
                      <img 
                        src={getCategoryImage(cat.slug)} 
                        alt={cat.name} 
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs sm:text-sm font-black truncate ${isCatActive ? "text-[#7b1113]" : "text-[#1d1d1f] group-hover:text-[#7b1113]"}`}>
                        {cat.name}
                      </div>
                      <div className="text-[10px] font-extrabold text-slate-400 mt-0.5 flex items-center gap-1 group-hover:text-amber-600">
                        <span>View catalog</span>
                        <ArrowRight size={10} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
