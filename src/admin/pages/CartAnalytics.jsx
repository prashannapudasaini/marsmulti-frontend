import API_BASE_URL from "@/config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShoppingCart, AlertTriangle, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { StatCard } from "../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";

export const CartAnalytics = () => {
  const [carts, setCarts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchCarts = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/carts`, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        const list = res.data?.recent_carts || res.data?.items || (Array.isArray(res.data) ? res.data : []);
        const formatted = list.map((item, index) => ({
          id: item.id || index + 101,
          customer_email: item.customer_email || item.user_identifier || "guest@session",
          items_count: item.items_count || item.item_count || 1,
          estimated_value: item.estimated_value || item.cart_value || 0,
          last_modified: item.last_modified || item.created_at || "Recent",
          status: item.is_abandoned ? "Abandoned Cart" : "Active Shopping"
        }));
        setCarts(formatted);
      } catch (err) {
        setCarts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCarts();
  }, [authState.token]);

  const totalValue = carts.reduce((acc, c) => acc + (c.estimated_value || 0), 0);
  const abandonedCount = carts.filter((c) => c.status && c.status.includes("Abandoned")).length;

  const columns = [
    {
      key: "id",
      header: "Cart Session ID",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-2xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-slate-900 block text-sm">Cart #{val}</span>
            <span className="text-[11px] font-medium text-slate-400">{row.customer_email}</span>
          </div>
        </div>
      )
    },
    {
      key: "items_count",
      header: "Hardware Qty",
      render: (val) => <span className="px-3 py-1 bg-slate-100 text-slate-800 font-extrabold rounded-lg text-xs">{val} Items Locked</span>
    },
    {
      key: "estimated_value",
      header: "Cart Valuation (NPR)",
      align: "right",
      render: (val) => <span className="font-extrabold text-slate-900 text-sm">NPR {val.toLocaleString()}</span>
    },
    {
      key: "last_modified",
      header: "Session Activity",
      render: (val) => <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {val}</span>
    },
    {
      key: "status",
      header: "Cart Disposition",
      align: "right",
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          val && val.includes("Abandoned") ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-emerald-100 text-emerald-800 border border-emerald-300"
        }`}>
          {val}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Active & Abandoned Cart Telemetry</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor live shopping baskets and recover potential unconfirmed revenue from dormant sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Locked Cart Revenue" value={totalValue} prefix="NPR " growth={12.4} icon={DollarSign} subtitle="Total unfinished value" />
        <StatCard title="Active Cart Sessions" value={carts.length} growth={8.0} icon={ShoppingCart} subtitle="Concurrent shoppers" />
        <StatCard title="Abandoned Baskets" value={abandonedCount} growth={-5.2} icon={AlertTriangle} subtitle="Target for recovery vouchers" />
      </div>

      <DataTable
        columns={columns}
        data={carts}
        isLoading={isLoading}
        searchPlaceholder="Search customer email or cart ID..."
        emptyTitle="No Active Carts Recorded"
        emptyDescription="All active customer baskets have been checked out into verified COD orders."
        exportFileName="mars_multi_cart_sessions.csv"
      />
    </div>
  );
};
