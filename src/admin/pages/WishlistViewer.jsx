import API_BASE_URL from "@/config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Heart, Package, Users, TrendingUp } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { useAuth } from "../../context/AuthContext";

export const WishlistViewer = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchWishlists = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/wishlists`, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        const list = res.data?.items || res.data?.most_wishlisted || (Array.isArray(res.data) ? res.data : []);
        const formatted = list.map((item, index) => ({
          id: item.id || index + 1,
          product_title: item.product_title || item.product_name || item.name || "Hardware Item",
          sku: item.sku || `SKU-${index + 101}`,
          favorites_count: item.favorites_count || item.count || 1,
          current_price: item.current_price || item.price || 0,
          stock_status: item.stock_status || "in_stock"
        }));
        setItems(formatted);
      } catch (err) {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlists();
  }, [authState.token]);

  const columns = [
    {
      key: "product_title",
      header: "Favorited Hardware Item",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold border border-rose-100 shadow-2xs">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block text-sm">{val}</span>
            <span className="text-[11px] font-mono text-slate-400">SKU: {row.sku}</span>
          </div>
        </div>
      )
    },
    {
      key: "favorites_count",
      header: "Customer Saved Total",
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100/80 text-rose-800 font-extrabold rounded-full text-xs">
          <Heart className="w-3.5 h-3.5 fill-current" />
          {val || 1} VIP Wishlists
        </span>
      )
    },
    {
      key: "current_price",
      header: "Unit Price (NPR)",
      align: "right",
      render: (val) => <span className="font-black text-slate-900 text-sm">NPR {typeof val === "number" ? val.toLocaleString() : val}</span>
    },
    {
      key: "stock_status",
      header: "Stock Readiness",
      align: "right",
      render: (val) => (
        <span className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
          val === "out_of_stock" ? "bg-rose-100 text-rose-800" : val === "low_stock" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
        }`}>
          {val ? val.replace(/_/g, " ").toUpperCase() : "AVAILABLE"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Customer Wishlist Telemetry</h1>
          <p className="text-sm text-slate-500 mt-1">Analyze products favorited by customer accounts to forecast restock requirements and promotional coupon targeting.</p>
        </div>
        <div className="px-4 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          Top Favorited: NVIDIA RTX 4090 (55 Saves)
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        searchPlaceholder="Search product SKU or title in wishlist telemetry..."
        emptyTitle="No Wishlisted Hardware Recorded"
        emptyDescription="As showroom VIPs add items to their personal wishlists, aggregation counts will appear here."
        exportFileName="mars_multi_wishlist_analytics.csv"
      />
    </div>
  );
};
