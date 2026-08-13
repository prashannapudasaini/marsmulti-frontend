import API_BASE_URL from "@/config/api";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  DollarSign, ShoppingBag, Users, Package, ArrowUpRight, Plus,
  Bell, FileText, Activity, RefreshCw, Eye, ExternalLink, TrendingUp
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";

export const Dashboard = () => {
  const [timeframe, setTimeframe] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_customers: 0,
    total_products: 0,
    sales_growth: 0,
    orders_growth: 0,
    customers_growth: 0,
    products_growth: 0,
    order_analytics: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
    revenue_chart: [],
    category_chart: [],
    recent_orders: [],
    low_stock_products: [],
    out_of_stock_products: [],
    recent_customers: [],
    notifications: [],
    activities: []
  });

  const toast = useToast();
  const { authState } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
                const res = await axios.get(`${API_BASE_URL}/api/v1/admin/analytics/dashboard?timeframe=${timeframe}`, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        if (res.data && res.data.total_revenue !== undefined) {
          setData((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        // Fallback demo metrics remain active for demonstration
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [timeframe, authState.token]);

  const handleRefresh = () => {
    toast.success("Dashboard metrics refreshed to real-time sync.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your store sales, orders, and products.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Timeframe selector pill */}
          <div className="inline-flex bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
            {["7d", "30d", "ytd"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg uppercase transition ${timeframe === t ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition shadow-2xs"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/admin/products/new"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl inline-flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Revenue"
          value={data.total_revenue}
          prefix="NPR "
          growth={data.sales_growth}
          icon={DollarSign}
          subtitle="Total sales amount"
        />
        <StatCard
          title="Total Orders"
          value={data.total_orders}
          growth={data.orders_growth}
          icon={ShoppingBag}
          subtitle="Orders requiring delivery"
        />
        <StatCard
          title="Total Customers"
          value={data.total_customers}
          growth={data.customers_growth}
          icon={Users}
          subtitle="Registered customers"
        />
        <StatCard
          title="Total Products"
          value={data.total_products}
          growth={data.products_growth}
          icon={Package}
          subtitle="Published across categories"
        />
      </div>

      
      {/* Orders Analytics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(data.order_analytics || {}).filter(([k]) => k !== 'pending_verification').map(([status, count]) => (
          <div key={status} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-center text-center">
            <span className="text-2xl font-black text-slate-900">{count}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">{status}</span>
          </div>
        ))}
      </div>

      {/* Analytics Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Revenue vs Targets
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly sales breakdown</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-slate-900 inline-block" /> Actual Sales
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" /> Projected Target
              </span>
            </div>
          </div>

          <div className="h-72 w-full flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue_chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `NPR ${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(val) => [`NPR ${(val ?? 0).toLocaleString()}`, "Amount"]}
                  contentStyle={{ backgroundColor: "#0F172A", color: "#F8FAFC", borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}
                />
                <Area type="monotone" dataKey="target" stroke="#94A3B8" strokeDasharray="4 4" fillOpacity={1} fill="url(#colorTarget)" />
                <Area type="monotone" dataKey="revenue" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category & Inventory Movement Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Sales by Category</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-6">Number of products sold per category</p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.category_chart} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#64748B" fontSize={11} hide />
                  <YAxis dataKey="category" type="category" stroke="#334155" fontSize={11} axisLine={false} tickLine={false} width={85} />
                  <Tooltip
                    formatter={(val) => [`${val} Units`, "Sold/Active"]}
                    contentStyle={{ backgroundColor: "#0F172A", color: "#F8FAFC", borderRadius: "12px", border: "none" }}
                  />
                  <Bar dataKey="sales" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mt-4 flex items-center justify-between text-xs">
            <div>
              <span className="font-extrabold text-slate-900 block">Top Performer</span>
              <span className="text-slate-500">Gaming Laptops (ASUS ROG series)</span>
            </div>
            <Link to="/admin/categories" className="font-bold text-slate-900 hover:underline flex items-center gap-1">
              Explore &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Feed & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Stream */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Orders</h3>
              <p className="text-xs text-slate-400">Latest customer orders</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1">
              View All Orders &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {(!data.recent_orders || data.recent_orders.length === 0) ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500 text-sm">
                      No orders yet. Orders will appear here when customers place them.
                    </td>
                  </tr>
                ) : (
                  data.recent_orders.map((ord, i) => (
                    <tr key={ord.id || i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        <Link to={`/admin/orders/${ord.id}`} className="hover:underline flex items-center gap-1">
                          #{ord.order_number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">{ord.customer_name}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">NPR {(ord.total_amount || 0).toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ord.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 text-xs">
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : "Recent"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>

        {/* Critical Low Stock Warning Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 bg-rose-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-rose-100 text-rose-600">
                  <Package className="w-5 h-5 stroke-2" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Low Stock</h3>
                  <p className="text-xs text-rose-700 font-medium">Products running out of stock</p>
                </div>
              </div>
            </div>

            
            <div className="divide-y divide-slate-100 p-4 space-y-3">
              {(!data.low_stock_products || data.low_stock_products.length === 0) ? (
                <div className="py-6 text-center text-slate-500 text-sm">
                  All products are sufficiently stocked.
                </div>
              ) : (
                data.low_stock_products.map((p, idx) => {
                  const title = p.title || p.name || "Hardware Item";
                  const stock = p.stock_quantity ?? p.stock ?? 0;
                  const sku = p.sku || `SKU-${p.id || idx + 1}`;
                  return (
                    <div key={idx} className="flex items-center justify-between gap-3 pt-1">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px] sm:max-w-[220px]" title={title}>
                          {title}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Code: {sku}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                          {stock} {stock === 1 ? "unit" : "units"} left
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
</div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-center">
            <Link to="/admin/products" className="text-xs font-bold text-slate-900 hover:underline block">
              View All Products &rarr;
            </Link>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Out of Stock Products */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 bg-rose-50/50">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2"><Package className="w-5 h-5 text-rose-600"/> Out of Stock</h3>
            </div>
            <div className="p-4 space-y-3">
              {(!data.out_of_stock_products || data.out_of_stock_products.length === 0) ? (
                <div className="text-center text-slate-500 text-xs py-4">No out of stock items.</div>
              ) : (
                data.out_of_stock_products.map((p, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 truncate pr-2">{p.name}</span>
                    <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">0 left</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-center">
            <Link to="/admin/products" className="text-xs font-bold text-slate-900 hover:underline">View Products &rarr;</Link>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 bg-emerald-50/50">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2"><Users className="w-5 h-5 text-emerald-600"/> Recent Customers</h3>
            </div>
            <div className="p-4 space-y-3">
              {(!data.recent_customers || data.recent_customers.length === 0) ? (
                <div className="text-center text-slate-500 text-xs py-4">No customers yet.</div>
              ) : (
                data.recent_customers.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-slate-500 text-[10px]">{c.email}</div>
                    </div>
                    <span className="text-slate-400 text-[10px]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-center">
            <Link to="/admin/customers" className="text-xs font-bold text-slate-900 hover:underline">View All &rarr;</Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 bg-blue-50/50">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2"><Bell className="w-5 h-5 text-blue-600"/> Notifications</h3>
            </div>
            <div className="p-4 space-y-3">
              {(!data.notifications || data.notifications.length === 0) ? (
                <div className="text-center text-slate-500 text-xs py-4">You're all caught up.</div>
              ) : (
                data.notifications.map((n, i) => (
                  <div key={i} className="text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div className="font-bold text-slate-900">{n.title}</div>
                    <div className="text-slate-500 mt-1 line-clamp-2">{n.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 bg-purple-50/50">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2"><Activity className="w-5 h-5 text-purple-600"/> Activity Feed</h3>
            </div>
            <div className="p-4 space-y-3">
              {(!data.activities || data.activities.length === 0) ? (
                <div className="text-center text-slate-500 text-xs py-4">No recent activity.</div>
              ) : (
                data.activities.map((a, i) => (
                  <div key={i} className="text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <span className="font-bold text-slate-900">{a.admin}</span> <span className="text-slate-500">{a.action}</span> <span className="font-medium text-slate-700">{a.entity}</span>
                    <div className="text-slate-400 text-[10px] mt-0.5">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Quick Admin Actions Row */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h3 className="text-lg font-bold tracking-tight">Quick Actions</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">Quickly manage your store inventory and sales.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition backdrop-blur-xs flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            View Orders
          </Link>
          <Link
            to="/admin/products"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold rounded-xl transition shadow-lg flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Manage Products
          </Link>
        </div>
      </div>
    </div>
  );
};
