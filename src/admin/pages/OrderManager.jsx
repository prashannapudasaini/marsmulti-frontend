import API_BASE_URL from "@/config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShoppingBag, Phone, MapPin, CheckCircle, Clock, Truck, Package, X, Filter, Download, ArrowRight } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";

export const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const toast = useToast();
  const { authState } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const headers = { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` };
        const [codRes, unifRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/v1/admin/orders`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/api/v1/admin/orders/unified`, { headers }).catch(() => ({ data: [] }))
        ]);
        const codOrders = (codRes.data?.items || (Array.isArray(codRes.data) ? codRes.data : [])).map(o => ({ ...o, payment_method: "COD", isUnified: false }));
        const unifOrders = (Array.isArray(unifRes.data) ? unifRes.data : []).map(o => ({ ...o, isUnified: true, phone: o.customer_phone }));
        
        const combined = [...unifOrders, ...codOrders];
        setOrders(combined);
      } catch (err) {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [authState.token]);

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      const targetOrder = orders.find(o => o.id === orderId);
      const headers = { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` };
      if (targetOrder && targetOrder.isUnified) {
        await axios.patch(`${API_BASE_URL}/api/v1/admin/orders/unified/${orderId}`, { status: nextStatus }, { headers });
      } else {
        await axios.put(`${API_BASE_URL}/api/v1/admin/orders/${orderId}/status?new_status=${nextStatus}`, {}, { headers });
      }
      toast.success(`Order #${orderId} status advanced to '${nextStatus.replace(/_/g, " ")}'.`);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      toast.error("Failed to update order status on server.");
    }
  };

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status.toLowerCase() === statusFilter.toLowerCase());

  const columns = [
    {
      key: "id",
      header: "Order Reference",
      render: (val, row) => {
        const method = row.payment_method || "COD";
        const badgeColors = {
          eSewa: "text-emerald-700 bg-emerald-100 border-emerald-200",
          Khalti: "text-purple-700 bg-purple-100 border-purple-200",
          ConnectIPS: "text-blue-700 bg-blue-100 border-blue-200",
          Fonepay: "text-red-700 bg-red-100 border-red-200",
          COD: "text-amber-700 bg-amber-100 border-amber-200"
        };
        return (
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold border border-slate-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 block text-sm">{row.order_number || `#${val}`}</span>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded border inline-block mt-1 ${badgeColors[method] || badgeColors.COD}`}>
                {method} {row.payment_status ? `• ${row.payment_status}` : ""}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: "customer_name",
      header: "Customer Info",
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900 block text-sm">{val}</span>
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
            {row.phone || row.customer_phone || "No Phone Recorded"}
          </span>
          {row.tracking_number && (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-1">
              🚚 {row.tracking_number}
            </span>
          )}
        </div>
      )
    },
    {
      key: "total_amount",
      header: "Total (NPR)",
      align: "right",
      render: (val) => <span className="font-black text-slate-900 text-sm">NPR {val.toLocaleString()}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: "created_at",
      header: "Date",
      align: "right",
      render: (val) => <span className="text-xs text-slate-500 font-medium">{val}</span>
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      sortable: false,
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedOrder(row); }}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-2xs inline-flex items-center gap-1"
        >
          Details &rarr;
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track customer orders.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {[
            { label: "All Orders", val: "all" },
            { label: "Pending", val: "pending_call_verification" },
            { label: "Confirmed", val: "confirmed" },
            { label: "Shipped", val: "shipped" },
            { label: "Delivered", val: "delivered" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setStatusFilter(f.val)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                statusFilter === f.val ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        isLoading={isLoading}
        searchPlaceholder="Search order #, customer phone number, address..."
        onRowClick={(row) => setSelectedOrder(row)}
        emptyTitle="No Orders Match Filter"
        emptyDescription="No orders match your filter."
        exportFileName="mars_multi_cod_orders.csv"
      />

      {/* Order Inspection Slide-over / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full h-full max-h-[95vh] shadow-2xl border border-slate-200 overflow-y-auto flex flex-col justify-between p-6 animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-xl">Order #{selectedOrder.id}</h3>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Placed on {selectedOrder.created_at} via {selectedOrder.payment_method}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Customer Verification Section */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 mb-6 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Customer Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold block">Name</span>
                    <span className="font-extrabold text-slate-900">{selectedOrder.customer_name}</span>
                    <span className="text-xs text-slate-500 block">{selectedOrder.email}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold block">Phone Number</span>
                    <a href={`tel:${selectedOrder.phone}`} className="font-extrabold text-emerald-600 hover:underline text-base block">
                      {selectedOrder.phone}
                    </a>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold mt-0.5 inline-block">Contact Customer</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> Shipping Address
                  </span>
                  <p className="font-semibold text-slate-800 leading-relaxed">{selectedOrder.address}</p>
                </div>
              </div>

              {/* Order Items Matrix */}
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Order Items</h4>
                <div className="divide-y divide-slate-100 bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{item.title}</h5>
                        <span className="text-[11px] font-mono text-slate-400">SKU: {item.sku} | Qty: {item.qty}</span>
                      </div>
                      <span className="font-black text-slate-900 text-sm whitespace-nowrap">
                        NPR {(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="p-4 bg-slate-50/80 flex items-center justify-between border-t border-slate-200">
                    <span className="font-bold text-slate-700 text-sm">Total Amount</span>
                    <span className="font-black text-slate-900 text-lg">NPR {selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Advancement Actions */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Update Order Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, "confirmed")}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition text-center ${
                      selectedOrder.status === "confirmed" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Mark as Confirmed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, "shipped")}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition text-center ${
                      selectedOrder.status === "shipped" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Mark as Shipped
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, "delivered")}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition text-center ${
                      selectedOrder.status === "delivered" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Mark as Delivered
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, "cancelled")}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition text-center ${
                      selectedOrder.status === "cancelled" ? "bg-rose-600 text-white border-rose-600" : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700"
                    }`}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-right mt-6">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
