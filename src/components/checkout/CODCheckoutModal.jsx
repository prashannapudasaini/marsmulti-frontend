import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { useCart } from "../../hooks/useCart";
import { useCODOrder } from "../../hooks/useOrder";
import { validatePhone, validateAddress } from "../../utils/validation";
import { formatNPR } from "../../utils/currency";
import { Truck, ShieldAlert, ShieldCheck } from "lucide-react";

export function CODCheckoutModal() {
  const { items, totalPrice, isCheckoutOpen, setIsCheckoutOpen, clearCart, setLastCompletedOrder } = useCart();
  const codMutation = useCODOrder();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "Kathmandu",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your valid full name (minimum 2 characters).";
    }
    if (!validatePhone(formData.phone)) {
      newErrors.phone = "Valid Nepali mobile number required for dispatch phone verification (e.g. 9800000000).";
    }
    if (!validateAddress(formData.address)) {
      newErrors.address = "Please provide complete street address and nearest landmark (min 5 characters).";
    }
    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = "City name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      customer_name: formData.fullName.trim(),
      customer_phone: formData.phone.trim(),
      delivery_address: formData.address.trim(),
      city: formData.city.trim(),
      items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    };

    codMutation.mutate(payload, {
      onSuccess: (data) => {
        setLastCompletedOrder({
          orderNumber: data.order_number,
          totalAmount: data.total_amount || totalPrice,
          customerName: formData.fullName,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}`,
          whatsappUrl: data.whatsapp_url || data.whatsapp_verification_link,
        });
        clearCart();
        setIsCheckoutOpen(false);
        setFormData({ fullName: "", phone: "", address: "", city: "Kathmandu" });
      },
    });
  };

  return (
    <Modal
      isOpen={isCheckoutOpen}
      onClose={() => !codMutation.isPending && setIsCheckoutOpen(false)}
      title="Step 1: Verification & Delivery Form"
      subtitle="Complete this form to reserve your warehouse hardware instantly."
      className="!max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* COD Verification Trust Banner */}
        <div className="p-4 rounded-2xl bg-[#7b1113]/5 border border-[#7b1113]/20 flex items-center gap-3.5 text-xs text-[#1d1d1f] shadow-xs">
          <div className="p-2.5 bg-[#7b1113] text-white rounded-xl shrink-0 shadow-xs">
            <Truck size={20} />
          </div>
          <span className="leading-relaxed font-semibold">
            <strong className="text-[#7b1113] font-black">Zero Advance Payment Required.</strong> Our executive will call your mobile number to confirm delivery details before dispatching your package across Nepal.
          </span>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <Input
            label="Full Customer Name"
            placeholder="e.g., Ram Shrestha"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            error={errors.fullName}
            disabled={codMutation.isPending}
            autoFocus
          />
          <Input
            label="Primary Mobile Number (Strictly Verified for COD)"
            placeholder="e.g., 9800000000 or +9779800000000"
            helperText="Our team will call or WhatsApp this number shortly after submission."
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            error={errors.phone}
            disabled={codMutation.isPending}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Full Street Address & Landmark"
                placeholder="e.g., Putalisadak, opposite to Star Mall"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                error={errors.address}
                disabled={codMutation.isPending}
              />
            </div>
            <div>
              <Input
                label="City / District"
                placeholder="e.g., Kathmandu"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                error={errors.city}
                disabled={codMutation.isPending}
              />
            </div>
          </div>
        </div>

        {/* API Error Notification */}
        {codMutation.isError && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs font-bold text-rose-700 animate-fadeIn">
            <ShieldAlert size={18} className="text-rose-600 shrink-0" />
            <span>{codMutation.error?.message || "Failed to process COD order. Please verify connection to port 8000 and try again."}</span>
          </div>
        )}

        {/* Order Summary & Unified Actions */}
        <div className="pt-5 border-t border-[#e5e5ea] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Due on Delivery:</p>
            <p className="text-2xl font-mono font-black text-[#1d1d1f] tracking-tight">{formatNPR(totalPrice)}</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsCheckoutOpen(false)}
              disabled={codMutation.isPending}
              className="flex-1 sm:flex-initial font-bold !py-3"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={codMutation.isPending}
              className="flex-1 sm:flex-initial !bg-[#7b1113] hover:!bg-[#5e0c0e] text-white font-black shadow-md !py-3 !px-7"
            >
              Confirm COD Order
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
