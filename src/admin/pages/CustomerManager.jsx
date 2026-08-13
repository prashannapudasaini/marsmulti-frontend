import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Mail, Phone, MapPin, ShieldCheck, UserCheck, Search as SearchIcon, Calendar, Award } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";

export const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/api/v1/admin/customers", {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setCustomers(res.data?.items || (Array.isArray(res.data) ? res.data : []));
      } catch (err) {
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [authState.token]);

  const columns = [
    {
      key: "full_name",
      header: "Customer Name & Avatar",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white font-extrabold flex items-center justify-center text-sm shadow-2xs">
            {val ? val[0].toUpperCase() : "C"}
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block text-sm">{val || "Unnamed VIP"}</span>
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400" />
              {row.email}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "phone",
      header: "Contact Number",
      render: (val) => <span className="font-mono text-xs text-slate-700 font-semibold">{val || "No telephone recorded"}</span>
    },
    {
      key: "orders_count",
      header: "Orders Placed",
      align: "right",
      render: (val) => <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-xs">{val || 0} Orders</span>
    },
    {
      key: "total_spent",
      header: "Lifetime Spend (NPR)",
      align: "right",
      render: (val) => <span className="font-extrabold text-emerald-700 text-sm">NPR {typeof val === "number" ? val.toLocaleString() : val || 0}</span>
    },
    {
      key: "is_verified",
      header: "KYC Verification",
      render: (val) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
          val ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"
        }`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          {val ? "Verified VIP" : "Pending Email KYC"}
        </span>
      )
    },
    {
      key: "joined",
      header: "Member Since",
      render: (val) => <span className="text-xs text-slate-400 font-medium">{val || "Recent"}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Showroom Customers & VIPs</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor registered customer accounts, total lifetime expenditure in NPR, and KYC validation.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200/80 text-xs font-extrabold">
          <Award className="w-4 h-4 text-emerald-600" />
          VIP Loyalty Tier Active
        </div>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        searchPlaceholder="Search customer name, email address, phone..."
        onRowClick={(row) => setSelectedCustomer(row)}
        emptyTitle="No Customer Accounts Registered"
        emptyDescription="Your registered user database is empty. Customers appear here once they create accounts."
        exportFileName="mars_multi_vip_customers.csv"
      />

      {/* Customer Quick Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white text-2xl font-black mx-auto flex items-center justify-center shadow-lg mb-3">
              {selectedCustomer.full_name ? selectedCustomer.full_name[0] : "C"}
            </div>
            <h3 className="text-lg font-black text-slate-900">{selectedCustomer.full_name}</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedCustomer.email} | {selectedCustomer.phone}</p>
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6 text-xs">
              <div>
                <span className="text-slate-400 block font-bold">Total Orders</span>
                <span className="text-base font-black text-slate-900">{selectedCustomer.orders_count} Purchases</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Total Spend</span>
                <span className="text-base font-black text-emerald-600">NPR {selectedCustomer.total_spent.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition shadow-sm"
            >
              Close Customer Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
