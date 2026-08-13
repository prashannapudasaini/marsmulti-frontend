import React, { useRef, useState, useEffect } from "react";
import { useProducts, useCategories } from "../../hooks/useProducts";
import { useUrlParams } from "../../hooks/useUrlParams";
import { scrollToTop } from "../layout/LenisScrollProvider";
import { CategoryPills } from "./CategoryPills";
import { ProductCard } from "./ProductCard";
import { ProductDetailView } from "./ProductDetailView";
import { Spinner } from "../common/Spinner";
import { 
  Sparkles, PackageOpen, ShieldCheck, Zap, CheckCircle, 
  ArrowRight, Layers, MessageCircle, ChevronRight, ChevronLeft
} from "lucide-react";
import { SHOWROOM_CATEGORIES } from "../../constants/categories";
import { CONFIG } from "../../constants/config";

// Helper Subcomponent for Horizontal Slidable Product Section (Responsive & Compact on Phones)
function ProductSlider({ title, subtitle, products, onQuickView, onViewAll, badge }) {
  const sliderRef = useRef(null);

  const slideLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -500, behavior: "smooth" });
    }
  };

  const slideRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 500, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {/* Section Header with Minimal Vertical Gap */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-[#7b1113] via-[#9e2023] to-[#d97706] bg-clip-text text-transparent">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-0.5 bg-[#7b1113]/10 text-[#7b1113] border border-[#7b1113]/20 font-black text-[9px] sm:text-xs uppercase tracking-wider rounded-md sm:rounded-lg">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-[#7b1113] hover:text-[#5e0c0e] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white hover:bg-slate-50 border border-[#e5e5ea] transition-all cursor-pointer mr-1 sm:mr-2 shadow-2xs"
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </button>
          )}
          <button
            onClick={slideLeft}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] hover:border-[#7b1113] text-[#1d1d1f] flex items-center justify-center transition-all shadow-2xs sm:shadow-xs cursor-pointer active:scale-95"
            aria-label="Slide Left"
            title="Slide Left"
          >
            <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={slideRight}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] hover:border-[#7b1113] text-[#1d1d1f] flex items-center justify-center transition-all shadow-2xs sm:shadow-xs cursor-pointer active:scale-95"
            aria-label="Slide Right"
            title="Slide Right"
          >
            <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Horizontal Slidable Product Strip - Notice compact mobile card width (170px) */}
      <div 
        ref={sliderRef}
        className="flex items-stretch gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar pb-2 pt-0.5 px-0.5 scroll-smooth snap-x"
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            className="w-[170px] xs:w-[180px] sm:w-[260px] md:w-[285px] shrink-0 snap-start flex flex-col"
          >
            <ProductCard 
              product={product} 
              onQuickView={() => onQuickView(product)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper Subcomponent for Horizontal Slidable Category Showcase (Compact on Mobile)
function CategorySlider({ categories, getCategoryImage, onSelectCategory }) {
  const catSliderRef = useRef(null);

  const slideLeft = () => {
    if (catSliderRef.current) {
      catSliderRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const slideRight = () => {
    if (catSliderRef.current) {
      catSliderRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-2 sm:space-y-2.5 pt-3 border-t border-[#e5e5ea]/80 mb-2 sm:mb-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg sm:text-2xl font-heading font-black tracking-tight bg-gradient-to-r from-[#7b1113] via-[#9e2023] to-[#d97706] bg-clip-text text-transparent">
            Shop by Category
          </h2>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-0.5">
            Compact hardware directory with real-time stock availability
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={slideLeft}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] hover:border-[#7b1113] text-[#1d1d1f] flex items-center justify-center transition-all shadow-2xs sm:shadow-xs cursor-pointer active:scale-95"
            aria-label="Slide Left"
          >
            <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={slideRight}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white border border-[#e5e5ea] hover:bg-[#f5f5f7] hover:border-[#7b1113] text-[#1d1d1f] flex items-center justify-center transition-all shadow-2xs sm:shadow-xs cursor-pointer active:scale-95"
            aria-label="Slide Right"
          >
            <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Horizontal Single Line Category Strip - Clean items with NO outer white boxes and hidden scrollbars */}
      <div 
        ref={catSliderRef}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="flex items-stretch gap-2.5 sm:gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden py-1 sm:py-1.5 scroll-smooth snap-x"
      >
        {categories.map((cat) => (
          <button
            key={cat.id || cat.slug}
            onClick={() => { 
              onSelectCategory(cat.slug); 
              scrollToTop(false); 
            }}
            className="w-[82px] sm:w-[115px] shrink-0 snap-start flex flex-col items-center justify-start gap-1.5 sm:gap-2 text-center group cursor-pointer select-none transition-transform active:scale-95"
          >
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white group-hover:bg-[#fff7f7] border border-[#e5e5ea]/80 group-hover:border-[#7b1113]/60 shadow-2xs group-hover:shadow-md flex items-center justify-center p-0.5 sm:p-1 overflow-hidden transition-all duration-200 group-hover:-translate-y-1">
              <img 
                src={getCategoryImage(cat.slug)} 
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300 drop-shadow-2xs" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 group-hover:text-[#7b1113] leading-tight line-clamp-2 transition-colors">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ShowroomCatalog({ searchTerm }) {
  const { category: activeCategory, product: selectedProductSlug, sort: activeSort, updateParams } = useUrlParams();

  const { data: products, isLoading, isError, error } = useProducts({
    category: activeCategory,
    search: searchTerm,
    sort: activeSort,
  });

  const { data: categories } = useCategories();
  const selectedProduct = products?.find((p) => p.slug === selectedProductSlug) || null;
  const isRootHomepageView = !activeCategory && !searchTerm && !activeSort;
  const trendingProducts = products?.filter((p) => p.is_trending || p.is_featured).slice(0, 12) || [];

  const [visibleCount, setVisibleCount] = useState(15); // Show 3 lines of 5 on desktop initially

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(15);
  }, [activeCategory, searchTerm, activeSort]);

  const displayCatList = (categories && categories.length > 0) ? categories : SHOWROOM_CATEGORIES;

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

  const openWhatsAppSupport = () => {
    const number = (CONFIG.WHATSAPP_SUPPORT_NUMBER || "+9779800000000").replace("+", "");
    window.open(`https://wa.me/${number}?text=Hello%20Mars%20Multi%20team!%20I%20have%20an%20inquiry%20regarding%20hardware%20and%20COD%20delivery.`, "_blank");
  };

  const handleOpenProduct = (p) => {
    updateParams({ product: p.slug });
    scrollToTop(false);
  };

  // IF A PRODUCT IS SELECTED, RENDER FULL PRODUCT DETAILS PAGE (NOT SIDEBAR)
  if (selectedProductSlug) {
    return (
      <section className="bg-[#f8f2f2] relative min-h-screen">
        {/* Edge-to-edge Navigation Bar */}
        <CategoryPills
          activeCategory={activeCategory}
          onSelectCategory={(slug) => {
            updateParams({ category: slug, product: "" });
            scrollToTop(false);
          }}
          activeSort={activeSort}
          onSelectSort={(val) => updateParams({ sort: val, product: "" })}
        />

        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 mt-1 sm:mt-2">
          <ProductDetailView
            product={selectedProduct}
            productSlug={selectedProductSlug}
            allProducts={products || []}
            onBack={() => {
              updateParams({ product: "" });
              scrollToTop(false);
            }}
            onSelectProduct={(p) => {
              updateParams({ product: p.slug });
              scrollToTop(false);
            }}
          />
        </div>

        {/* Floating Instant WhatsApp Support Button */}
        <button
          onClick={openWhatsAppSupport}
          className="fixed bottom-5 right-5 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 group"
          title="Instant WhatsApp Support & COD Dispatch"
          aria-label="Contact Customer Support via WhatsApp"
        >
          <MessageCircle size={23} className="fill-current text-white drop-shadow-xs" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-600 border-2 border-white animate-pulse" />
        </button>
      </section>
    );
  }

  return (
    <section className="bg-[#f8f2f2] relative pb-12 min-h-screen">
      {/* Edge-to-edge Navigation Bar */}
      <CategoryPills
        activeCategory={activeCategory}
        onSelectCategory={(slug) => updateParams({ category: slug })}
        activeSort={activeSort}
        onSelectSort={(val) => updateParams({ sort: val })}
      />

      {/* Full-Width Trust & Partner Verification Strip - Responsive text sizing for phones */}
      <div className="border-b border-[#e5e5ea] bg-white py-2 shadow-xs mb-3 sm:mb-6">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-0.5 w-full md:w-auto">
            <span className="flex items-center gap-1 sm:gap-1.5 text-[#1d1d1f] font-black shrink-0">
              <CheckCircle size={14} className="text-[#7b1113]" /> 100% Genuine Hardware
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5 text-[#1d1d1f] font-black shrink-0">
              <Zap size={14} className="text-emerald-600 fill-current" /> Express Nationwide COD
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5 text-[#1d1d1f] font-black shrink-0">
              <ShieldCheck size={14} className="text-[#7b1113]" /> Distributor Warranty
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Content Width Container */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* UI State: Loading */}
        {isLoading && (
          <div className="py-24 flex items-center justify-center">
            <Spinner size="lg" label="Synchronizing Mars Multi warehouse catalog..." />
          </div>
        )}

        {/* UI State: Error */}
        {isError && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e5e5ea] text-center max-w-xl mx-auto my-8 shadow-lg">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-3 font-bold text-2xl">!</div>
            <h3 className="text-base sm:text-lg font-black text-[#1d1d1f]">Backend API Server Offline</h3>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5 leading-relaxed">
              {error?.message || "Could not connect to backend database service. Using offline showroom catalog fallbacks."}
            </p>
          </div>
        )}

        {/* UI State: Empty */}
        {!isLoading && !isError && products && products.length === 0 && (
          <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 bg-white p-8 rounded-3xl border border-[#e5e5ea] shadow-md animate-scaleIn my-6">
            <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] border border-[#e5e5ea] flex items-center justify-center text-[#7b1113]">
              <PackageOpen size={36} />
            </div>
            <h3 className="text-xl font-black text-[#1d1d1f]">No Hardware Found</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
              We couldn't locate active hardware matching your selected category or search parameter.
            </p>
            <button
              onClick={() => updateParams({ category: "", sort: "" })}
              className="px-6 py-3 rounded-xl bg-[#7b1113] text-white text-xs font-black hover:bg-[#5e0c0e] transition-all duration-200 shadow-md cursor-pointer"
            >
              Reset Filters & Show All
            </button>
          </div>
        )}

        {/* MODE A: Root Homepage View - Single Line Slidable Strips with Low Vertical Spacing */}
        {!isLoading && !isError && products && products.length > 0 && isRootHomepageView && (
          <div className="space-y-6 sm:space-y-7 animate-fadeIn">
            
            {/* 1. TRENDING NOW SECTION (Slidable Single Line, 12 Products) */}
            <ProductSlider
              title="Trending Now"
              badge="Top 12"
              products={trendingProducts}
              onQuickView={(p) => handleOpenProduct(p)}
            />

            {/* 2. SUBSEQUENT CATEGORY PRODUCT SECTIONS (In exact requested order, slidable with minimal gaps) */}
            {displayCatList.map((cat) => {
              const catProducts = products.filter((p) => p.category_id === cat.id || p.category_slug === cat.slug);
              if (catProducts.length === 0) return null;

              return (
                <div key={cat.id || cat.slug} className="pt-2 border-t border-[#e5e5ea]/60">
                  <ProductSlider
                    title={cat.name}
                    products={catProducts}
                    onQuickView={(p) => handleOpenProduct(p)}
                    onViewAll={() => {
                      updateParams({ category: cat.slug });
                      scrollToTop(false);
                    }}
                  />
                </div>
              );
            })}

            {/* 3. CATEGORIES SECTION AT THE BOTTOM (Single Line Slidable, Small Fully Fitted Images) */}
            <CategorySlider
              categories={displayCatList}
              getCategoryImage={getCategoryImage}
              onSelectCategory={(slug) => updateParams({ category: slug })}
            />

            {/* 4. ALL HARDWARE CATCH-ALL GRID */}
            <div className="pt-8 mt-8 border-t border-[#e5e5ea]/60">
              <div className="flex items-center gap-2 mb-4 px-1">
                <Layers size={20} className="text-[#7b1113]" />
                <h3 className="text-lg font-black text-[#1d1d1f]">All Hardware Collection</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-5">
                {products.slice(0, visibleCount).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onQuickView={(p) => handleOpenProduct(p)} 
                  />
                ))}
              </div>
              {products.length > 15 && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => {
                      if (visibleCount >= products.length) {
                        setVisibleCount(15);
                        scrollToTop(false);
                      } else {
                        setVisibleCount(prev => prev + 15);
                      }
                    }}
                    className="bg-white border-2 border-[#e5e5ea] text-[#1d1d1f] hover:border-[#7b1113] hover:text-[#7b1113] font-black text-sm px-8 py-3 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    {visibleCount >= products.length ? "Show Less Options" : "Load More Options"}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* MODE B: Filtered / Searched Grid View - 2 columns on mobile phone! */}
        {!isLoading && !isError && products && products.length > 0 && !isRootHomepageView && (
          <div className="space-y-5 animate-fadeIn mt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-slate-700 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#e5e5ea] shadow-2xs">
              <span className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                <Layers size={15} className="text-[#7b1113] shrink-0" /> Department: <span className="font-black text-[#7b1113] uppercase px-2 py-0.5 bg-[#7b1113]/10 rounded-md">{activeCategory ? (displayCatList.find(c=>c.slug===activeCategory)?.name || activeCategory) : ""} {searchTerm ? `Search: "${searchTerm}"` : ""}</span>
              </span>
              <button
                onClick={() => {
                  updateParams({ category: "", sort: "" });
                  scrollToTop(false);
                }}
                className="text-[#7b1113] hover:underline font-black cursor-pointer bg-[#7b1113]/10 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs transition-colors hover:bg-[#7b1113] hover:text-white"
              >
                Show All Sections
              </button>
            </div>
            
            {/* 2-column compact grid on phone displays (grid-cols-2), scaling to 5 columns on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-5">
              {products.slice(0, visibleCount).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onQuickView={(p) => handleOpenProduct(p)} 
                />
              ))}
            </div>
            {products.length > 15 && (
              <div className="mt-8 flex justify-center pb-8">
                <button 
                  onClick={() => {
                    if (visibleCount >= products.length) {
                      setVisibleCount(15);
                      scrollToTop(false);
                    } else {
                      setVisibleCount(prev => prev + 15);
                    }
                  }}
                  className="bg-white border-2 border-[#e5e5ea] text-[#1d1d1f] hover:border-[#7b1113] hover:text-[#7b1113] font-black text-sm px-8 py-3 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  {visibleCount >= products.length ? "Show Less Options" : "Load More Options"}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Floating Instant WhatsApp Support Button */}
      <button
        onClick={openWhatsAppSupport}
        className="fixed bottom-5 right-5 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 group"
        title="Instant WhatsApp Support & COD Dispatch"
        aria-label="Contact Customer Support via WhatsApp"
      >
        <MessageCircle size={23} className="fill-current text-white drop-shadow-xs" />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-600 border-2 border-white animate-pulse" />
      </button>

    </section>
  );
}
