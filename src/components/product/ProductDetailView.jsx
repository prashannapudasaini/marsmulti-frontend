import React, { useState } from "react";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Spinner } from "../common/Spinner";
import { formatNPR } from "../../utils/currency";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { useProductDetail } from "../../hooks/useProducts";
import { ProductCard } from "./ProductCard";
import {
  ShieldCheck, Truck, Zap, ShoppingBag, ArrowRight, Star,
  CheckCircle2, ArrowLeft, PhoneCall, Cpu, Monitor, HardDrive,
  Database, ScreenShare, Layers, Sparkles, Box, Wrench, Check, ChevronLeft, ChevronRight
} from "lucide-react";

export function ProductDetailView({ product: passedProduct, productSlug, allProducts = [], onBack, onSelectProduct }) {
  const { addItem, setIsCheckoutOpen, setIsLoginPromptOpen } = useCart();
  const { isAuthenticated } = useAuth();

  const { data: fetchedProduct, isLoading } = useProductDetail(
    productSlug,
    Boolean(productSlug) // Always fetch to get full details like images
  );

  // Prefer fully fetched product (which includes .images), fallback to passed product while loading
  const product = fetchedProduct || passedProduct;

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const allGalleryImages = React.useMemo(() => {
    const list = [];
    if (!product) return list;
    if (product.image_url) {
      list.push(product.image_url);
    }
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img.image_url && img.image_url !== product.image_url) {
          list.push(img.image_url);
        }
      });
    }
    return list;
  }, [product]);

  if (isLoading && !product) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" label="Retrieving hardware specification matrix..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center max-w-md mx-auto bg-white p-8 rounded-3xl border border-[#e5e5ea] shadow-md">
        <h3 className="text-xl font-black text-[#1d1d1f]">Hardware SKU Not Found</h3>
        <p className="text-sm font-semibold text-slate-500 mt-2">
          The requested product model is currently offline in our warehouse catalog.
        </p>
        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 bg-[#7b1113] text-white font-black text-xs px-6 py-3 rounded-xl hover:bg-[#5e0c0e] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} /> Return to Showroom Catalog
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;

  const getOriginalPrice = () => {
    if (product.discount_price && product.discount_price < product.price) {
      return product.price;
    }
    return null;
  };

  const getDisplayPrice = () => {
    if (product.discount_price && product.discount_price < product.price) {
      return product.discount_price;
    }
    return product.price;
  };

  const originalPrice = getOriginalPrice();
  const displayPrice = getDisplayPrice();
  const discountAmount = originalPrice ? originalPrice - displayPrice : 0;

  const currentDisplayImage = allGalleryImages.length > 0 ? allGalleryImages[activeImageIdx] : null;

  const nextImage = () => setActiveImageIdx((prev) => (prev + 1) % allGalleryImages.length);
  const prevImage = () => setActiveImageIdx((prev) => (prev - 1 + allGalleryImages.length) % allGalleryImages.length);

  const handleBuyNowCOD = () => {
    if (!isAuthenticated) {
      setIsLoginPromptOpen(true);
      return;
    }
    addItem(product, 1);
    setIsCheckoutOpen(true);
  };

  // Related models from the same category
  const relatedProducts = allProducts
    .filter((p) => (p.category_id === product.category_id || p.category_slug === product.category_slug) && p.id !== product.id)
    .slice(0, 6);

  // Helper to intelligently get icon for spec key
  const getSpecIcon = (key) => {
    const k = key.toLowerCase();
    if (k.includes("processor") || k.includes("cpu") || k.includes("chip") || k.includes("core")) {
      return <Cpu size={18} className="text-[#7b1113] shrink-0 mt-0.5" />;
    }
    if (k.includes("graphics") || k.includes("gpu") || k.includes("nvidia") || k.includes("rtx") || k.includes("radeon")) {
      return <Sparkles size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />;
    }
    if (k.includes("memory") || k.includes("ram") || k.includes("ddr")) {
      return <HardDrive size={18} className="text-[#0058ff] shrink-0 mt-0.5" />;
    }
    if (k.includes("storage") || k.includes("ssd") || k.includes("hdd") || k.includes("nvme")) {
      return <Database size={18} className="text-emerald-600 shrink-0 mt-0.5" />;
    }
    if (k.includes("display") || k.includes("screen") || k.includes("resolution") || k.includes("monitor") || k.includes("oled") || k.includes("panel")) {
      return <ScreenShare size={18} className="text-purple-600 shrink-0 mt-0.5" />;
    }
    if (k.includes("warranty") || k.includes("guarantee") || k.includes("service")) {
      return <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />;
    }
    return <Layers size={18} className="text-slate-500 shrink-0 mt-0.5" />;
  };

  // Extract key highlight specs for instant visibility above fold
  const getQuickSpecs = () => {
    const rawSpecs = product.specs && typeof product.specs === "object" ? product.specs : {};
    const quickList = [];

    // Order of importance for instant viewing (Graphics & CPU first!)
    const priorityKeys = ["Graphics", "Processor", "Memory", "Storage", "Display", "Warranty", "Display Size", "Touch Technology", "Operating System"];

    priorityKeys.forEach(pk => {
      Object.entries(rawSpecs).forEach(([k, v]) => {
        if (k.toLowerCase().includes(pk.toLowerCase()) && !quickList.some(item => item.key === k)) {
          quickList.push({ key: k, value: v });
        }
      });
    });

    // Add remaining specs up to 6 items total for the top cards
    Object.entries(rawSpecs).forEach(([k, v]) => {
      if (!quickList.some(item => item.key === k) && quickList.length < 6) {
        quickList.push({ key: k, value: v });
      }
    });

    // If it's a laptop/desktop with missing graphics tag, add standard high-performance indicator
    if (quickList.length < 4) {
      if (product.category_slug === "laptop" || product.category_slug === "desktop") {
        if (!quickList.some(q => q.key.toLowerCase().includes("graphics"))) {
          quickList.unshift({ key: "Graphics & Video", value: "High-Performance Integrated & Discrete Display Engine" });
        }
      }
    }

    return quickList;
  };

  const quickSpecs = getQuickSpecs();

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-16">

      {/* Sleek Top Breadcrumbs & Back Navigation (Ultra-minimal vertical spacing) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white py-2 px-3.5 sm:px-4 rounded-xl border border-[#e5e5ea] shadow-2xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-black text-xs sm:text-sm text-[#7b1113] hover:text-[#5e0c0e] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-400">
          <span className="hidden sm:inline">Showroom</span>
          <span className="hidden sm:inline">/</span>
          <span className="text-slate-700 font-extrabold uppercase">{product.brand || "Hardware"}</span>
          <span>/</span>
          <span className="text-[#7b1113] font-extrabold truncate max-w-[200px] sm:max-w-md">{product.title}</span>
        </div>
      </div>

      {/* Main Two-Column PDP Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">

        {/* Left Column: High-Res Studio Render & Value Pillars (7 cols on Desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/11] w-full rounded-2xl sm:rounded-3xl bg-white border border-[#e5e5ea] p-4 sm:p-10 shadow-sm flex items-center justify-center overflow-hidden group">
            {currentDisplayImage ? (
              <img
                src={currentDisplayImage}
                alt={product.title}
                className="w-full h-full object-contain filter drop-shadow-lg transform group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="text-slate-400 font-mono text-sm font-semibold">[Studio Render Unavailable]</div>
            )}

            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex flex-col gap-1.5">
              <span className="px-3 py-1 bg-[#7b1113] text-white rounded-full text-[10px] sm:text-xs font-black tracking-wider shadow-2xs self-start">
                OFFICIAL NEPAL STOCK
              </span>
              {discountAmount > 0 && (
                <span className="px-2.5 py-0.5 bg-[#e8f8f0] text-[#0d8248] border border-[#d1f2e2] rounded-full text-[10px] sm:text-xs font-extrabold self-start shadow-2xs">
                  Save {formatNPR(discountAmount)} Today
                </span>
              )}
            </div>

            <div className="absolute top-3 right-3 sm:top-5 sm:right-5">
              <Badge count={product.stock_quantity} />
            </div>

            {allGalleryImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 flex items-center justify-center shadow-lg hover:bg-white hover:text-[#7b1113] hover:scale-110 transition-all z-10 cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 flex items-center justify-center shadow-lg hover:bg-white hover:text-[#7b1113] hover:scale-110 transition-all z-10 cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Gallery Strip */}
          {allGalleryImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 py-2">
              {allGalleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIdx === idx 
                      ? "border-[#7b1113] shadow-md ring-2 ring-[#7b1113]/20 scale-[1.02] z-10" 
                      : "border-[#e5e5ea] bg-white opacity-60 hover:opacity-100 hover:border-slate-300 hover:scale-[1.01]"
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.title} view ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Key Specs Deck, Pricing & Buy Actions (5 cols on Desktop) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-[#e5e5ea] shadow-md space-y-5 lg:sticky lg:top-28">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#f5f5f7] border border-[#e5e5ea] text-[#7b1113]">
                {product.brand || "MARS MULTI"} AUTHORISED
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[#7b1113] via-[#9e2023] to-[#d97706] bg-clip-text text-transparent leading-tight tracking-tight pt-1">
              {product.title}
            </h1>
            <p className="text-[11px] font-mono font-bold text-slate-400">SKU Reference: #{product.slug}</p>
          </div>

          {/* INSTANT HARDWARE SPECIFICATION SNAPSHOT - What buyers look at first! */}
          {quickSpecs && quickSpecs.length > 0 && (
            <div className="space-y-2 bg-[#f8f9fa] p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" /> Key Hardware Specs
                </span>
                <span className="text-[10px] font-extrabold text-[#7b1113] uppercase bg-[#7b1113]/10 px-2 py-0.5 rounded-full">
                  Verified Configuration
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickSpecs.map((qs, i) => (
                  <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs flex items-start gap-2.5 transition-all hover:border-[#7b1113]/40">
                    {getSpecIcon(qs.key)}
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tight block truncate">
                        {qs.key}
                      </span>
                      <span className="text-xs font-extrabold text-[#1d1d1f] line-clamp-2 leading-tight mt-0.5">
                        {qs.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Box */}
          <div className="space-y-1.5 bg-[#f8f2f2] p-4 sm:p-5 rounded-2xl border border-[#7b1113]/20">
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider block">Authorised Cash on Delivery Price:</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-4xl font-mono font-black text-[#1d1d1f] tracking-tight">
                {formatNPR(displayPrice)}
              </span>
              <span className="text-xs sm:text-base font-semibold text-slate-400 line-through">
                {formatNPR(originalPrice)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-emerald-700 pt-1">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <span>Includes official distributor tax invoice & warranty</span>
            </div>
          </div>

          {/* Action Buttons Deck */}
          <div className="space-y-3 pt-1">
            <Button
              variant="primary"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleBuyNowCOD}
              className="w-full !bg-[#7b1113] hover:!bg-[#5e0c0e] font-black text-white shadow-xl !py-3.5 sm:!py-4 !rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
            >
              <span>Instant Buy via Cash on Delivery</span>
              <ArrowRight size={18} />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              disabled={isOutOfStock}
              onClick={() => addItem(product, 1)}
              className="w-full !bg-[#f5f5f7] hover:!bg-[#e5e5ea] font-extrabold text-[#1d1d1f] !py-3 !rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#e5e5ea] cursor-pointer active:scale-98 transition-all"
            >
              <ShoppingBag size={17} className="text-[#7b1113]" />
              <span>Add to Live Shopping Cart</span>
            </Button>
          </div>

          {/* Assistance Note */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-[11px] sm:text-xs font-medium text-slate-600">
            <PhoneCall size={20} className="text-amber-600 shrink-0" />
            <span>Need technician consultation before ordering? Open our WhatsApp line at the corner for instant advice.</span>
          </div>
        </div>
      </div>

      {/* Compact Trust Pillars (Moved here to balance columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <div className="p-4 rounded-2xl bg-white border border-[#e5e5ea] flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#7b1113]/10 text-[#7b1113] flex items-center justify-center shrink-0 font-bold">
            <Truck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#1d1d1f] uppercase tracking-wider">Zero-Risk COD</h4>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">Pay cash directly upon parcel arrival after package inspection.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e5e5ea] flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#7b1113]/10 text-[#7b1113] flex items-center justify-center shrink-0 font-bold">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#1d1d1f] uppercase tracking-wider">Authorised Warranty</h4>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">Genuine factory parts and repair support backed by official distributors.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e5e5ea] flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
            <Zap size={20} className="fill-current" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#1d1d1f] uppercase tracking-wider">Express Dispatch</h4>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">Immediate warehouse checkout and telephonic verification prior to shipping.</p>
          </div>
        </div>
      </div>

      {/* Engineering Overview & Detailed Specification Table Section */}
      <div className="space-y-6 pt-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e5e5ea] shadow-sm overflow-hidden">

          {/* Section Header */}
          <div className="bg-gradient-to-r from-[#1a0304] via-[#47070a] to-[#7b1113] p-5 sm:p-7 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-widest block mb-1">
                Complete Engineering Profile
              </span>
              <h2 className="text-lg sm:text-2xl font-heading font-black tracking-tight text-white">
                Detailed Hardware Specifications Table
              </h2>
              <p className="text-xs font-medium text-slate-300 mt-0.5">
                Comprehensive component breakdown, silicon architecture, and Nepal warranty inclusions
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-black text-white shadow-xs">
              <Wrench size={15} className="text-amber-300" />
              <span>100% Authentic Configuration</span>
            </div>
          </div>

          {/* Product Overview Summary Banner */}
          {(product.description || product.meta_description) && (
            <div className="p-5 sm:p-7 bg-[#fdfafb] border-b border-[#e5e5ea]">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#7b1113] mb-2 flex items-center gap-2">
                <Check size={16} className="text-emerald-600 stroke-[3]" /> Product Description
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed max-w-4xl whitespace-pre-wrap">
                {product.description || product.meta_description}
              </p>
            </div>
          )}

          {/* Deep Specification Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f5f5f7] border-b border-[#e5e5ea] text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5 sm:px-7 w-1/3 sm:w-1/4 border-r border-[#e5e5ea]">Component Category</th>
                  <th className="py-3.5 px-5 sm:px-7">Hardware Specification Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5ea]/70 text-xs sm:text-sm">

                {/* Always include Model & Brand Identifier Row */}
                <tr className="hover:bg-[#f8f9fa] transition-colors bg-white">
                  <th className="py-4 px-5 sm:px-7 font-bold text-slate-600 align-top border-r border-[#e5e5ea]/60 bg-slate-50/50 flex items-center gap-2.5">
                    <Box size={16} className="text-[#7b1113] shrink-0" />
                    <span>Brand & SKU Code</span>
                  </th>
                  <td className="py-4 px-5 sm:px-7 font-black text-[#1d1d1f] font-mono">
                    {product.brand} #{product.slug}
                  </td>
                </tr>

                {/* Iterate through explicit product specs */}
                {product.specs && typeof product.specs === "object" && (
                  Object.entries(product.specs).map(([key, value], idx) => (
                    <tr key={idx} className={`hover:bg-[#f8f9fa] transition-colors ${idx % 2 === 0 ? "bg-[#fcfafc]/40" : "bg-white"}`}>
                      <th className="py-4 px-5 sm:px-7 font-bold text-slate-600 align-top border-r border-[#e5e5ea]/60 flex items-start sm:items-center gap-2.5">
                        {getSpecIcon(key)}
                        <span className="capitalize">{key}</span>
                      </th>
                      <td className="py-4 px-5 sm:px-7 font-extrabold text-[#1d1d1f] leading-relaxed break-words">
                        {value}
                      </td>
                    </tr>
                  ))
                )}

                {/* Standard Enterprise Assurance Rows */}
                <tr className="hover:bg-[#f8f9fa] transition-colors bg-white">
                  <th className="py-4 px-5 sm:px-7 font-bold text-slate-600 align-top border-r border-[#e5e5ea]/60 flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Box Contents & Accessories</span>
                  </th>
                  <td className="py-4 px-5 sm:px-7 font-extrabold text-slate-800 leading-relaxed">
                    Sealed hardware unit, original factory AC power adapter/cable, documentation, and official Nepal distributor warranty card.
                  </td>
                </tr>

                <tr className="hover:bg-[#f8f9fa] transition-colors bg-[#fdfafb]">
                  <th className="py-4 px-5 sm:px-7 font-bold text-slate-600 align-top border-r border-[#e5e5ea]/60 flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-[#7b1113] shrink-0" />
                    <span>Nepal Warranty Support</span>
                  </th>
                  <td className="py-4 px-5 sm:px-7 font-extrabold text-slate-800 leading-relaxed">
                    1 year of warranty.
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          <div className="bg-[#f5f5f7] p-4 text-center text-xs font-semibold text-slate-500 border-t border-[#e5e5ea]">
            ⚡ Specifications verified against official distributor technical data. Have questions about upgradability (RAM/SSD)? Contact our live engineers via WhatsApp.
          </div>
        </div>
      </div>

      {/* Related Hardware Models in this Department */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-[#e5e5ea]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-black tracking-tight bg-gradient-to-r from-[#7b1113] via-[#9e2023] to-[#d97706] bg-clip-text text-transparent">
                More in this Hardware Department
              </h2>
              <p className="text-xs font-bold text-slate-500">Related genuine hardware models available for immediate COD delivery</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onQuickView={() => onSelectProduct(rel)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
