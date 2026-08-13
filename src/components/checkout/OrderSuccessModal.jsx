import React from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useCart } from "../../hooks/useCart";
import { formatNPR } from "../../utils/currency";
import { CheckCircle2, MessageCircle, PhoneCall, ShieldCheck, Truck, PackageCheck } from "lucide-react";

export function OrderSuccessModal() {
  const { lastCompletedOrder, setLastCompletedOrder } = useCart();

  if (!lastCompletedOrder) return null;

  const { orderNumber, totalAmount, customerName, phone, address, whatsappUrl } = lastCompletedOrder;
  const displayOrderNum = orderNumber.startsWith("#") ? orderNumber : `#${orderNumber}`;

  const handleWhatsAppClick = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const message = `Hello! I placed COD Order ${displayOrderNum} for NPR ${totalAmount.toLocaleString()} to be delivered at ${address}. Name: ${customerName}, Phone: ${phone}. Please confirm dispatch!`;
    const url = `https://wa.me/9779800000000?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleClose = () => {
    setLastCompletedOrder(null);
  };

  const trackingSteps = [
    { label: "Order Received", desc: "Warehouse stock safely locked", done: true, icon: CheckCircle2 },
    { label: "Phone Verification", desc: "Executive call shortly", done: true, icon: PhoneCall },
    { label: "Express Dispatch", desc: "Out for delivery", done: false, icon: Truck },
    { label: "Cash on Delivery", desc: "Payment collected at door", done: false, icon: PackageCheck },
  ];

  return (
    <Modal
      isOpen={Boolean(lastCompletedOrder)}
      onClose={handleClose}
      title="Step 2: Instant Order Confirmation & Tracking"
      subtitle="Your hardware order has been registered in our Kathmandu logistics terminal."
      className="!max-w-2xl text-center"
    >
      <div className="flex flex-col items-center space-y-6 py-2">
        
        {/* Glowing Success Badge without bounce effect */}
        <div className="w-16 h-16 rounded-3xl bg-[#7b1113]/10 border border-[#7b1113]/20 flex items-center justify-center text-[#7b1113] shadow-md animate-scaleIn">
          <CheckCircle2 size={36} className="text-[#7b1113]" />
        </div>

        <div className="space-y-1.5 max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#1d1d1f] tracking-tight">
            COD Order Secured Successfully
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Your hardware inventory has been securely reserved in our warehouse. Our representative will call or WhatsApp your mobile number to verify delivery details prior to dispatch.
          </p>
        </div>

        {/* Professional Order Tracking Progress Timeline */}
        <div className="w-full bg-white border border-[#e5e5ea] rounded-2xl p-4 sm:p-6 shadow-xs text-left">
          <h4 className="text-xs font-black text-[#1d1d1f] uppercase tracking-wider mb-4">
            Order Dispatch Status Timeline
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 relative">
            {trackingSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-start space-y-1.5 p-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea]/80 relative">
                  <div className={`p-2 rounded-lg ${step.done ? "bg-[#7b1113] text-white shadow-xs" : "bg-slate-200 text-slate-500"}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-extrabold text-[#1d1d1f] mt-1 block">{step.label}</span>
                  <span className="text-[10px] text-slate-500 font-semibold leading-tight">{step.desc}</span>
                  <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${step.done ? "bg-[#7b1113]" : "bg-slate-300"}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Receipt Details Casing */}
        <div className="w-full bg-[#f5f5f7] p-5 sm:p-6 rounded-2xl border border-[#e5e5ea] text-left space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-3.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order Reference:</span>
            <span className="px-3.5 py-1.5 bg-[#1d1d1f] text-white font-mono font-black text-sm sm:text-base rounded-xl shadow-sm">
              {displayOrderNum}
            </span>
          </div>
          <div className="text-xs sm:text-sm space-y-2 text-[#1d1d1f]">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500 font-bold">Customer Name:</span>
              <span className="font-extrabold text-[#1d1d1f]">{customerName}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500 font-bold">Registered Phone:</span>
              <span className="font-mono font-bold text-[#1d1d1f]">{phone}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500 font-bold">Delivery Destination:</span>
              <span className="font-semibold text-right text-[#1d1d1f] max-w-[280px] truncate">{address}</span>
            </div>
          </div>
          <div className="pt-3.5 border-t border-[#e5e5ea] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payable on Delivery:</span>
            <span className="text-2xl font-mono font-black text-[#1d1d1f]">{formatNPR(totalAmount)}</span>
          </div>
        </div>

        {/* Instant WhatsApp Support & Showroom Return */}
        <div className="w-full space-y-3 pt-1">
          <Button
            variant="primary"
            size="lg"
            onClick={handleWhatsAppClick}
            className="w-full !bg-[#7b1113] hover:!bg-[#5e0c0e] text-white font-black py-3.5 shadow-md flex items-center justify-center gap-2.5 text-base"
          >
            <MessageCircle size={22} className="fill-current text-white" />
            Confirm Instant Dispatch via WhatsApp
          </Button>

          <button
            onClick={handleClose}
            className="text-xs font-bold text-slate-500 hover:text-[#1d1d1f] underline transition-colors cursor-pointer block mx-auto py-1"
          >
            Return to Digital Showroom
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-slate-500 pt-3 border-t border-[#e5e5ea] w-full">
          <span className="flex items-center gap-1.5"><PhoneCall size={14} className="text-[#7b1113]" /> Call verification in progress</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#7b1113]" /> Stock safely reserved in terminal</span>
        </div>
      </div>
    </Modal>
  );
}
