import API_BASE_URL from "@/config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart2, ArrowUp, ArrowDown, Package, User, FileText } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { useAuth } from "../../context/AuthContext";

export const InventoryTracker = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchInventoryLogs = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/inventory`, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setLogs(res.data?.items || (Array.isArray(res.data) ? res.data : []));
      } catch (err) {
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventoryLogs();
  }, [authState.token]);

  const columns = [
    {
      key: "product_name",
      header: "Hardware Product SKU",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block text-sm">{val}</span>
            <span className="text-[11px] text-slate-400 font-medium">Modified by {row.updated_by || "Admin"}</span>
          </div>
        </div>
      )
    },
    {
      key: "difference",
      header: "Stock Delta / Adjustment",
      align: "right",
      render: (val, row) => {
        const isPos = val >= 0;
        return (
          <span className={`inline-flex items-center gap-1 font-extrabold px-3 py-1 rounded-full text-xs ${
            isPos ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
          }`}>
            {isPos ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
            {isPos ? `+${val} units` : `${val} units`}
          </span>
        );
      }
    },
    {
      key: "new_stock",
      header: "Resulting Stock",
      align: "right",
      render: (val, row) => (
        <span className="font-black text-slate-900 text-xs">
          <span className="text-slate-400 font-normal">{row.previous_stock} &rarr; </span>
          {val} units remaining
        </span>
      )
    },
    {
      key: "reason",
      header: "Adjustment Rationale & Ref",
      render: (val) => <span className="text-xs text-slate-600 font-medium block max-w-sm truncate">{val || "Manual Warehouse Adjustment"}</span>
    },
    {
      key: "created_at",
      header: "Timestamp",
      align: "right",
      render: (val) => <span className="text-xs text-slate-400 font-medium">{val || "Recent"}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Real-Time Inventory Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Audit log of every stock change, quantity replenishment, and COD order inventory deduction across the warehouse.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        searchPlaceholder="Search product name, adjustment reason, or operator..."
        emptyTitle="No Inventory Modifications Logged"
        emptyDescription="As warehouse quantities are updated or items sold, historical delta records will display here."
        exportFileName="mars_multi_inventory_tracking_logs.csv"
      />
    </div>
  );
};
