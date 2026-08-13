import React from "react";
import { Drawer } from "../common/Drawer";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Spinner } from "../common/Spinner";
import { formatNPR } from "../../utils/currency";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { useProductDetail } from "../../hooks/useProducts";
import { ShieldCheck, Truck, Zap, ShoppingBag, ArrowRight, Star, CheckCircle2 } from "lucide-react";

export function ProductDrawer({ product: passedProduct, productSlug, isOpen, onClose }) {
  const { addItem, setIsCheckoutOpen, setIsLoginPromptOpen } = useCart();
  const { isAuthenticated } = useAuth();

  const { data: fetchedProduct, isLoading } = useProductDetail(
    productSlug,
    isOpen && !passedProduct && Boolean(productSlug)
  );

  const product = passedProduct || fetchedProduct;

  if (isLoading && isOpen && !product) {
    return (
      <Drawer isOpen={isOpen} onClose={onClose} title="Hardware Specifications" className="!max-w-2xl">
        <div className="py-28 flex items-center justify-center">
          <Spinner size="md" label="Retrieving Apple-tier specifications matrix..." />
        </div>
      </Drawer>
    );
  }

  if (!product) return null;
  const isOutOfStock = product.stock_quantity <= 0;

  const handleBuyNowCOD = () => {
    if (!isAuthenticated) {
      setIsLoginPromptOpen(true);
      return;
    }
    addItem(product, 1);
    onClose();
    setIsCheckoutOpen(true);
  };

  const footerActions = (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Payable on Delivery:</span>
          <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1 mt-0.5">
            <CheckCircle2 size={12} /> Includes VAT & Official Warranty
          </span>
        </div>
        <span className="text-2xl sm:text-3xl font-mono font-black text-[#1d1d1f]">{formatNPR(product.price)}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button
          variant="secondary"
          size="md"
          disabled={isOutOfStock}
          onClick={() => {
            addItem(product, 1);
            onClose();
          }}
          className="!bg-[#f5f5f7] hover:!bg-[#e5e5ea] font-bold text-[#1d1d1f] !py-3 !rounded-xl"
        >
          <ShoppingBag size={18} className="text-[#7b1113]" /> Add to Live Cart
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={isOutOfStock}
          onClick={handleBuyNowCOD}
          className="!bg-[#7b1113] hover:!bg-[#5e0c0e] font-black text-white shadow-md !py-3 !rounded-xl"
        >
          Buy via COD <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={product.brand}
      subtitle={`Model SKU: #${product.slug}`}
      footer={footerActions}
      className="!max-w-2xl"
    >
      {/* Studio Image Gallery & Stock Overlay */}
      <div className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-gradient-to-b from-[#ffffff] to-[#f5f5f7] border border-[#e5e5ea] shadow-inner p-4 sm:p-6 flex items-center justify-center group">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.title} 
            className="w-full h-full object-contain filter drop-shadow-xl transform group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="text-slate-400 font-mono text-xs font-semibold">[Studio Render Unavailable]</div>
        )}
        <div className="absolute top-4 right-4">
          <Badge count={product.stock_quantity} />
        </div>
      </div>

      {/* Apple-Tier Product Information Header */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#f5f5f7] border border-[#e5e5ea] text-[#7b1113] font-mono">
            {product.brand} Authorised Model
          </span>
          <span className="flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            <Star size={13} className="fill-amber-400 text-amber-500" /> 4.9 / 5.0 (Verified Score)
          </span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#7b1113] via-[#9e2023] to-[#d97706] bg-clip-text text-transparent leading-tight tracking-tight">
          {product.title}
        </h1>

        {/* Pricing Deck Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#f5f5f7] p-5 rounded-2xl border border-[#e5e5ea] shadow-xs">
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Authorised Cash on Delivery Price</p>
            <p className="text-3xl font-mono font-black text-[#1d1d1f] tracking-tight">{formatNPR(product.price)}</p>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-xs whitespace-nowrap">
            <Zap size={15} className="text-emerald-600 fill-current" /> Instant Kathmandu Dispatch
          </span>
        </div>
      </div>

      {/* COD & Warranty Trust Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-white border border-[#e5e5ea] flex items-start gap-3.5 shadow-xs">
          <div className="p-2.5 rounded-xl bg-[#7b1113]/5 text-[#7b1113] shrink-0">
            <Truck size={22} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#1d1d1f] uppercase tracking-wider">Zero-Risk Cash on Delivery</h4>
            <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">Delivering across Kathmandu, Lalitpur, and major Nepali hubs. Inspect package before payment.</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#e5e5ea] flex items-start gap-3.5 shadow-xs">
          <div className="p-2.5 rounded-xl bg-[#7b1113]/5 text-[#7b1113] shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#1d1d1f] uppercase tracking-wider">Authorised Brand Warranty</h4>
            <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">Full factory parts and repair coverage backed directly by official distributors.</p>
          </div>
        </div>
      </div>

      {/* Apple-Style Technical Specification Matrix */}
      <div className="space-y-4 pt-4 pb-2">
        <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#1d1d1f]">
            Technical Specifications Matrix
          </h3>
          <span className="text-[11px] font-mono font-bold text-slate-400">100% Authentic Hardware</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e5ea] overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-[#e5e5ea]/70">
              {product.specs && typeof product.specs === "object" ? (
                Object.entries(product.specs).map(([key, value], idx) => (
                  <tr key={idx} className={`hover:bg-[#f5f5f7]/80 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-[#f5f5f7]/40"}`}>
                    <th className="py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3 align-top border-r border-[#e5e5ea]/50">
                      {key}
                    </th>
                    <td className="py-3.5 px-5 text-sm font-bold text-[#1d1d1f] break-words">
                      {value}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-6 text-slate-400 font-medium text-center text-sm">No additional specifications documented for this SKU.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Buyer Assurance Note */}
      <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-[#e5e5ea] text-center text-xs text-slate-600 font-medium">
        🔒 All hardware is sealed, serial-verified, and inspected prior to dispatch. Need assistance? Our technical support team confirms all COD orders via telephone before shipment.
      </div>
    </Drawer>
  );
}
