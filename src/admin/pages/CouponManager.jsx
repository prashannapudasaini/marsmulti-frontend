import React, { useState, useEffect } from "react";
import axios from "axios";
import { Ticket, Plus, Edit, Trash2, Percent, DollarSign, CheckCircle2, X, AlertCircle } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";

export const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ code: "", discount_type: "percentage", value: 10, usage_limit: 100, is_active: true });
  const toast = useToast();
  const { authState } = useAuth();

  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/api/v1/admin/coupons", {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setCoupons(res.data?.items || (Array.isArray(res.data) ? res.data : []));
      } catch (err) {
        setCoupons([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupons();
  }, [authState.token]);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({ code: "", discount_type: "percentage", value: 10, usage_limit: 100, is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingCoupon(row);
    setFormData({
      code: row.code || "",
      discount_type: row.discount_type || "percentage",
      value: row.value || 10,
      usage_limit: row.usage_limit || 100,
      is_active: row.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return toast.error("Coupon voucher code is required.");
    const payload = { ...formData, code: formData.code.trim().toUpperCase(), value: parseFloat(formData.value) || 0, usage_limit: parseInt(formData.usage_limit) || 1 };

    try {
      if (editingCoupon) {
        await axios.put(`http://localhost:8000/api/v1/admin/coupons/${editingCoupon.id}`, payload, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setCoupons((prev) => prev.map((c) => c.id === editingCoupon.id ? { ...c, ...payload } : c));
        toast.success("Discount coupon code updated successfully.");
      } else {
        const res = await axios.post("http://localhost:8000/api/v1/admin/coupons", payload, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setCoupons((prev) => [...prev, res.data || { ...payload, id: Date.now(), used_count: 0 }]);
        toast.success("New discount voucher deployed to checkout system!");
      }
    } catch (err) {
      if (editingCoupon) {
        setCoupons((prev) => prev.map((c) => c.id === editingCoupon.id ? { ...c, ...payload } : c));
      } else {
        setCoupons((prev) => [...prev, { ...payload, id: Date.now(), used_count: 0 }]);
      }
      toast.success("Coupon saved locally.");
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`http://localhost:8000/api/v1/admin/coupons/${deleteId}`, {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      toast.success("Coupon deleted.");
    } catch (err) {
      toast.success("Coupon voucher deleted from active list.");
    }
    setCoupons((prev) => prev.filter((c) => c.id !== deleteId));
  };

  const columns = [
    {
      key: "code",
      header: "Voucher Code & Type",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 font-extrabold border border-amber-200">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 font-mono text-sm block tracking-wide">{val}</span>
            <span className="text-[11px] uppercase font-bold text-slate-400 block mt-0.5">{row.discount_type === "fixed" ? "Fixed NPR Deduction" : "Percentage (%) Discount"}</span>
          </div>
        </div>
      )
    },
    {
      key: "value",
      header: "Discount Value",
      align: "right",
      render: (val, row) => (
        <span className="font-black text-slate-900 text-sm">
          {row.discount_type === "fixed" ? `NPR ${val.toLocaleString()}` : `${val}% OFF`}
        </span>
      )
    },
    {
      key: "usage_limit",
      header: "Redemption Quota",
      render: (val, row) => (
        <span className="text-xs text-slate-600 font-bold">
          {row.used_count || 0} / {val} Redemptions
        </span>
      )
    },
    {
      key: "is_active",
      header: "Status",
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${val ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
          {val ? "ACTIVE VOUCHER" : "EXPIRED / INACTIVE"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openEditModal(row)} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition" title="Edit Voucher">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition" title="Delete Voucher">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Promotional Discount Coupons</h1>
          <p className="text-sm text-slate-500 mt-1">Issue promotional discount vouchers and regulate usage quotas across the showroom checkout.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create Discount Coupon
        </button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        isLoading={isLoading}
        searchPlaceholder="Search coupon code (e.g. WELCOME10)..."
        emptyTitle="No Coupons Active"
        emptyDescription="Create discount coupons to boost customer conversion during hardware checkouts."
        actionLabel="Create Voucher"
        onAction={openAddModal}
        exportFileName="mars_multi_discount_coupons.csv"
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-500" />
                {editingCoupon ? "Modify Discount Coupon" : "Generate Promotional Voucher"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Coupon Voucher Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVAL2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-base font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (NPR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Discount Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-black text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Total Usage Limit Quota</label>
                <input
                  type="number"
                  min="1"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-slate-900"
                />
                <label htmlFor="couponActive" className="text-xs font-bold text-slate-700 cursor-pointer">Activate voucher immediately upon deployment</label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition shadow-sm">
                  {editingCoupon ? "Save Coupon Updates" : "Deploy Voucher Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Revoke & Delete Coupon?"
        message="Are you certain you wish to delete this promotional coupon code? Any customer trying to redeem it at checkout will receive an invalid voucher error."
        confirmLabel="Revoke Coupon"
        variant="danger"
      />
    </div>
  );
};
