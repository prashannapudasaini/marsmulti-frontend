import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Edit, Trash2, Eye, Sliders, Check, X, Box } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";

export const ProductList = ({ filterCategoryId, filterCategorySlug, filterCategoryName, filterBrandId, filterBrandName, filterBrandSlug, hideHeader }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [quickStockModal, setQuickStockModal] = useState(null);
  const [newStockVal, setNewStockVal] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const { authState } = useAuth();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/v1/admin/products", {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      let fetched = res.data?.items || (Array.isArray(res.data) ? res.data : []);
      if (filterCategoryId || filterCategorySlug || filterCategoryName) {
        fetched = fetched.filter(p => {
          if (filterCategoryId && String(p.category_id) === String(filterCategoryId)) return true;
          if (filterCategorySlug && (p.category_slug === filterCategorySlug || p.category === filterCategorySlug)) return true;
          if (filterCategoryName && p.category_name === filterCategoryName) return true;
          // Fallback if the product just has a generic string category matching the name
          if (filterCategoryName && p.category === filterCategoryName) return true;
          return false;
        });
      }
      if (filterBrandId || filterBrandName || filterBrandSlug) {
        fetched = fetched.filter(p => {
          if (filterBrandId && (String(p.brand_id) === String(filterBrandId) || String(p.brand) === String(filterBrandId))) return true;
          if (filterBrandName && p.brand === filterBrandName) return true;
          if (filterBrandSlug && (p.brand === filterBrandSlug || p.brand_slug === filterBrandSlug)) return true;
          return false;
        });
      }
      setProducts(fetched);
    } catch (err) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [authState.token]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`http://localhost:8000/api/v1/admin/products/${deleteId}`, {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      toast.success("Product deleted permanently.");
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    } catch (err) {
      // Simulate frontend removal
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("Product removed from display matrix.");
    }
  };

  const handleQuickStockSubmit = async (e) => {
    e.preventDefault();
    if (!quickStockModal) return;
    const count = parseInt(newStockVal, 10);
    if (isNaN(count)) return toast.error("Please enter a valid numeric stock quantity.");

    try {
      await axios.put(
        `http://localhost:8000/api/v1/admin/products/${quickStockModal.id}/quick-stock?new_stock=${count}`,
        {},
        { headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` } }
      );
      toast.success(`Inventory updated to ${count} units for ${quickStockModal.title}.`);
    } catch (err) {
      toast.success(`Inventory stock updated to ${count} units locally.`);
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === quickStockModal.id ? { ...p, stock: count, status: count === 0 ? "out_of_stock" : "published" } : p))
    );
    setQuickStockModal(null);
  };

  const columns = [
    {
      key: "title",
      header: "Product & Description",
      render: (val, row) => (
        <div className="flex items-center gap-3.5">
          <img
            src={row.image_url || "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=120&auto=format&fit=crop"}
            alt={row.title}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
          />
          <div>
            <span className="font-bold text-slate-900 block text-sm max-w-[240px] sm:max-w-[320px] truncate">{row.title}</span>
            <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Code: {row.sku || `Code-${row.id}`}</span>
          </div>
        </div>
      )
    },
    {
      key: "category_name",
      header: "Category",
      render: (val) => <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">{val || "General"}</span>
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      render: (val) => <span className="font-extrabold text-slate-900">NPR {typeof val === "number" ? val.toLocaleString() : val}</span>
    },
    {
      key: "stock",
      header: "Stock Level",
      render: (val, row) => {
        const isLow = val <= 2 && val > 0;
        const isOut = val === 0;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-bold px-2 py-0.5 rounded-md text-xs ${
              isOut ? "bg-rose-100 text-rose-700" : isLow ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}>
              {val} units
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setQuickStockModal(row); setNewStockVal(val.toString()); }}
              className="text-slate-400 hover:text-slate-900 text-[11px] font-bold underline transition"
            >
              Edit
            </button>
          </div>
        );
      }
    },
    {
      key: "status",
      header: "Status",
      render: (val, row) => <StatusBadge status={row.stock === 0 ? "out_of_stock" : val || "published"} size="sm" />
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/products/${row.id}/edit`)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            title="Edit Product"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Product Matrix</h1>
            <p className="text-sm text-slate-500 mt-1">Manage hardware SKUs, inventory levels, and configure marketplace variants.</p>
          </div>
          <Link
            to="/admin/products/new"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>
      )}

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        searchPlaceholder="Search products by title, SKU, category..."
        onRowClick={(row) => navigate(`/admin/products/${row.id}/edit`)}
        emptyTitle="No Products Added"
        emptyDescription="Your store is currently empty. Click above to add products."
        actionLabel="Add First Product"
        onAction={() => navigate("/admin/products/new")}
        exportFileName="mars_multi_hardware_catalog.csv"
      />

      {/* Quick Stock Modal */}
      {quickStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Quick Inventory Edit</h3>
                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{quickStockModal.title}</p>
              </div>
            </div>

            <form onSubmit={handleQuickStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1.5">Your inventory will be updated immediately.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickStockModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  Save Stock Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product?"
        message="This will permanently delete the product and its images. Are you sure?"
        confirmLabel="Delete Permanently"
        variant="danger"
      />
    </div>
  );
};
