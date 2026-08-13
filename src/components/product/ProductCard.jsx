import React, { useState } from "react";
import { Eye, ShoppingCart, Zap, Clock, Star, Heart } from "lucide-react";
import { formatNPR } from "../../utils/currency";
import { useCart } from "../../hooks/useCart";

export function ProductCard({ product, onQuickView }) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const isOutOfStock = product.stock_quantity <= 0;

  const getDiscountBadge = () => {
    if (product.discount_badge) return product.discount_badge;
    if (product.discount_price && product.discount_price < product.price) {
      const diff = ((product.price - product.discount_price) / product.price) * 100;
      return `${Math.round(diff)}% OFF`;
    }
    return null;
  };

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

  const deliveryTag = product.delivery_tag || { type: "blue", text: "Get it in same day" };

  const renderActionButton = () => {
    if (isOutOfStock) {
      return (
        <button 
          disabled 
          className="bg-slate-200 text-slate-500 font-bold text-[9px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-full cursor-not-allowed inline-flex items-center gap-1 self-start truncate max-w-full"
        >
          Out of Stock
        </button>
      );
    }

    if (deliveryTag.type === "purple") {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(product);
          }}
          className="bg-[#8b2cf5] hover:bg-[#7620db] text-white font-bold text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-full inline-flex items-center gap-1 sm:gap-1.5 self-start shadow-sm transition-all duration-200 active:scale-95 cursor-pointer max-w-full"
          title="Pre-book this unit"
        >
          <Clock size={12} className="shrink-0 sm:w-[14px] sm:h-[14px]" />
          <span className="truncate">{deliveryTag.text}</span>
        </button>
      );
    }

    if (deliveryTag.type === "gray") {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(product);
          }}
          className="bg-[#ebf0f5] hover:bg-[#dde4ec] text-slate-800 font-bold text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-full inline-flex items-center gap-1 sm:gap-1.5 self-start transition-all duration-200 active:scale-95 cursor-pointer max-w-full"
          title="Add to cart with same-day COD delivery"
        >
          <ShoppingCart size={12} className="shrink-0 text-slate-700 sm:w-[14px] sm:h-[14px]" />
          <span className="truncate">{deliveryTag.text}</span>
        </button>
      );
    }

    // Default Blue button (same day delivery)
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          addItem(product);
        }}
        className="bg-[#0058ff] hover:bg-[#0049e6] text-white font-bold text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-full inline-flex items-center gap-1 sm:gap-1.5 self-start shadow-sm transition-all duration-200 active:scale-95 cursor-pointer max-w-full"
        title="Order for immediate same-day COD delivery"
      >
        <Zap size={12} className="shrink-0 fill-white sm:w-[14px] sm:h-[14px]" />
        <span className="truncate">{deliveryTag.text || "Get in same day"}</span>
      </button>
    );
  };

  return (
    <div 
      className="group relative bg-white border border-[#e5e5ea] hover:border-[#7b1113]/40 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs sm:shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer select-none"
      onClick={() => onQuickView(product)}
    >
      {/* Top Image & Badges */}
      <div className="relative aspect-[4/3] w-full bg-white overflow-hidden flex items-center justify-center p-2 sm:p-4 border-b border-[#f0f0f2]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-[10px] sm:text-xs font-semibold">
            [No Image Preview]
          </div>
        )}
        
        {/* Top Left Discount Badge - Compact for Mobile */}
        {getDiscountBadge() && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 bg-[#e8f8f0] text-[#0d8248] border border-[#d1f2e2] rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-tight shadow-2xs">
              {getDiscountBadge()}
            </span>
          </div>
        )}

        {/* Top Right Wishlist Button */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="p-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-400 hover:text-[#7b1113] transition-colors focus:outline-none hidden sm:group-hover:block"
            title="Wishlist"
          >
            <Heart size={14} className={isWishlisted ? "fill-[#7b1113] text-[#7b1113]" : ""} />
          </button>
        </div>

        {/* View Details Overlay on Hover */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/95 backdrop-blur-md border border-[#e5e5ea] text-[#1d1d1f] text-xs font-black rounded-xl shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Eye size={14} className="text-[#7b1113]" /> View Details
          </span>
        </div>
      </div>

      {/* Card Details Body - Tight padding and fonts on phone */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-2.5 sm:gap-4 bg-white">
        <div className="space-y-1 sm:space-y-2">
          <h3 
            className="font-extrabold text-[12px] sm:text-sm text-[#1d1d1f] group-hover:text-[#7b1113] transition-colors duration-200 line-clamp-2 leading-tight sm:leading-snug"
            title={product.title}
          >
            {product.title}
          </h3>

          <div className="flex items-baseline gap-1.5 sm:gap-2 pt-0.5 sm:pt-1 flex-wrap">
            <span className="text-sm sm:text-lg font-mono font-black text-[#1d1d1f] tracking-tight">
              {formatNPR(getDisplayPrice())}
            </span>
            {getOriginalPrice() && (
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 line-through">
                {formatNPR(getOriginalPrice())}
              </span>
            )}
          </div>
        </div>

        <div className="pt-0.5 sm:pt-1 mt-auto">
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
}
