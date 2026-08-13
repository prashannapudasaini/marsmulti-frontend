import React, { useState } from "react";
import { Drawer } from "../common/Drawer";
import { Button } from "../common/Button";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { formatNPR } from "../../utils/currency";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from "lucide-react";

export function CartDrawer() {
  const { items, totalItems, totalPrice, isCartOpen, setIsCartOpen, setIsCheckoutOpen, isLoginPromptOpen, setIsLoginPromptOpen, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setIsLoginPromptOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const footer = items.length > 0 ? (
    <div className="space-y-4">
      <div className="space-y-2 text-sm border-b border-[#e5e5ea] pb-3">
        <div className="flex justify-between font-medium text-slate-600">
          <span>Items Subtotal ({totalItems} unit{totalItems > 1 ? "s" : ""}):</span>
          <span className="font-mono font-bold text-[#1d1d1f]">{formatNPR(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-emerald-800 font-bold text-xs">
          <span>Delivery & COD Surcharge:</span>
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">FREE (Nepal Nationwide)</span>
        </div>
        <div className="flex justify-between text-lg font-black text-[#1d1d1f] pt-2">
          <span>Total COD Payable:</span>
          <span className="font-mono text-2xl text-[#1d1d1f] font-black">{formatNPR(totalPrice)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearCart} 
          className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold !px-3"
        >
          Clear
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleProceedToCheckout}
          className="flex-1 font-black !bg-[#7b1113] hover:!bg-[#5e0c0e] text-white shadow-md !py-3.5"
        >
          Proceed to COD Checkout <ArrowRight size={18} />
        </Button>
      </div>
      
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
        <ShieldCheck size={14} className="text-[#7b1113]" /> 100% Secure Checkout & Telephone Call Verification
      </div>
    </div>
  ) : null;

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      title="Live Showroom Cart"
      subtitle={`${totalItems} item(s) reserved for Cash on Delivery`}
      footer={footer}
    >
      {items.length === 0 ? (
        <div className="py-28 flex flex-col items-center justify-center text-center max-w-xs mx-auto space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-[#f5f5f7] border border-[#e5e5ea] flex items-center justify-center text-[#7b1113] shadow-inner">
            <ShoppingBag size={32} />
          </div>
          <p className="text-xl font-black text-[#1d1d1f]">Your Cart is Empty</p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Explore our immediate digital showroom and click "Add to Live Cart" or "Buy via COD" on any electronic model.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#e5e5ea]/80">
          {items.map((item) => (
            <div key={item.id} className="py-4 flex gap-4 items-start group">
              <img
                src={item.image_url || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80"}
                alt={item.title}
                className="w-20 h-20 rounded-2xl object-contain p-1 border border-[#e5e5ea] shrink-0 bg-white shadow-xs group-hover:border-[#7b1113]/30 transition-colors"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">{item.brand}</p>
                <h4 className="text-sm font-extrabold text-[#1d1d1f] truncate mt-0.5">{item.title}</h4>
                <p className="text-sm font-mono font-black text-[#1d1d1f] mt-1">
                  {formatNPR(item.price)}
                </p>
                
                {/* Quantity Controls */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="inline-flex items-center border border-[#e5e5ea] rounded-xl bg-[#ffffff] overflow-hidden shadow-xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-slate-600 hover:text-white hover:bg-[#7b1113] px-2.5 transition-colors font-black cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-3.5 py-1 text-xs font-mono font-black text-[#1d1d1f] bg-[#f5f5f7] select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= (item.stock_quantity || 99)}
                      className="p-1 text-slate-600 hover:text-white hover:bg-[#7b1113] px-2.5 transition-colors disabled:opacity-30 font-black cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-auto cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}
