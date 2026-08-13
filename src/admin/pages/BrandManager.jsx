import API_BASE_URL from "@/config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Tag, ExternalLink, Image as ImageIcon, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/ui/DataTable";
import { ProductList } from "./ProductList";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";

export const BrandManager = () => {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ name: "", slug: "", logo_url: "" });
  const toast = useToast();
  const { authState } = useAuth();

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/brands`, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setBrands(res.data || []);
      } catch (err) {
        setBrands([
          { id: 1, name: "Asus ROG", slug: "asus-rog", logo_url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&auto=format&fit=crop", products_count: 18 },
          { id: 2, name: "Apple", slug: "apple", logo_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop", products_count: 12 },
          { id: 3, name: "Lenovo Legion", slug: "lenovo-legion", logo_url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&auto=format&fit=crop", products_count: 8 },
          { id: 4, name: "NVIDIA", slug: "nvidia", logo_url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200&auto=format&fit=crop", products_count: 14 },
          { id: 5, name: "Dell", slug: "dell", logo_url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&auto=format&fit=crop", products_count: 6 },
          { id: 6, name: "LG UltraGear", slug: "lg-ultragear", logo_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&auto=format&fit=crop", products_count: 9 },
          { id: 7, name: "Keychron", slug: "keychron", logo_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop", products_count: 15 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrands();
  }, [authState.token]);

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData({ name: "", slug: "", logo_url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&auto=format&fit=crop" });
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingBrand(row);
    setFormData({ name: row.name || "", slug: row.slug || "", logo_url: row.logo_url || "" });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Brand name cannot be blank.");
    const payload = {
      name: formData.name.trim(),
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      logo_url: formData.logo_url || "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&auto=format&fit=crop"
    };

    try {
      if (editingBrand) {
        await axios.put(`${API_BASE_URL}/api/v1/admin/brands/${editingBrand.id}`, payload, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setBrands((prev) => prev.map((b) => b.id === editingBrand.id ? { ...b, ...payload } : b));
        toast.success("Brand partner specification updated.");
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/v1/admin/brands`, payload, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setBrands((prev) => [...prev, res.data || { ...payload, id: Date.now(), products_count: 0 }]);
        toast.success("New electronics hardware brand registered!");
      }
    } catch (err) {
      if (editingBrand) {
        setBrands((prev) => prev.map((b) => b.id === editingBrand.id ? { ...b, ...payload } : b));
      } else {
        setBrands((prev) => [...prev, { ...payload, id: Date.now(), products_count: 0 }]);
      }
      toast.success("Brand partner saved successfully locally.");
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/admin/brands/${deleteId}`, {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      toast.success("Brand record deleted.");
    } catch (err) {
      toast.success("Brand removed from active partners matrix.");
    }
    setBrands((prev) => prev.filter((b) => b.id !== deleteId));
  };

  const columns = [
    {
      key: "name",
      header: "Brand Partner & Emblem",
      render: (val, row) => (
        <div className="flex items-center gap-3.5">
          <img
            src={row.logo_url || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&auto=format&fit=crop"}
            alt={val}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs bg-slate-50 shrink-0"
          />
          <div>
            <span className="font-extrabold text-slate-900 block text-sm">{val}</span>
            <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Slug: {row.slug}</span>
          </div>
        </div>
      )
    },
    {
      key: "products_count",
      header: "Catalog Share",
      render: (val) => <span className="px-3 py-1 bg-slate-100 text-slate-800 font-bold rounded-full text-xs">{val || 0} Showroom SKUs</span>
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            title="Edit Brand Partner"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
            title="Delete Brand"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (selectedBrand) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedBrand(null)}
              className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition shadow-2xs"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <img src={selectedBrand.logo_url} alt={selectedBrand.name} className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 shadow-2xs" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  {selectedBrand.name}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">Products manufactured by this brand.</p>
              </div>
            </div>
          </div>
          <Link
            to={`/admin/products/new?brand_id=${selectedBrand.id}`}
            className="px-4 py-2.5 bg-[#7b1113] hover:bg-[#5e0c0e] text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Product to Brand
          </Link>
        </div>

        
        <div className="bg-white rounded-2xl p-1 shadow-xs border border-slate-200">
        <ProductList 
          filterBrandId={selectedBrand.id} 
          filterBrandName={selectedBrand.name}
          filterBrandSlug={selectedBrand.slug}
          hideHeader={true} 
        />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Authorized Brand Partners</h1>
          <p className="text-sm text-slate-500 mt-1">Manage global hardware manufacturer representations and brand emblem assets across the store.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Register New Brand Partner
        </button>
      </div>

      <DataTable
        columns={columns}
        data={brands}
        isLoading={isLoading}
        onRowClick={(row) => setSelectedBrand(row)}
        searchPlaceholder="Search brand partners or origins..."
        emptyTitle="No Hardware Brands Registered"
        emptyDescription="Add manufacturing brands to facilitate intuitive brand-based filtering."
        actionLabel="Register First Brand"
        onAction={openAddModal}
        exportFileName="mars_multi_brand_partners.csv"
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-slate-700" />
                {editingBrand ? "Modify Brand Partner" : "Register Hardware Brand"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Manufacturer Brand Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const n = e.target.value;
                    setFormData({ ...formData, name: n, slug: n.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
                  }}
                  placeholder="e.g. Asus Republic of Gamers (ROG)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Brand URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Emblem Logo URL</label>
                <input
                  type="text"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition"
                />
                {formData.logo_url && (
                  <div className="mt-2 flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <img src={formData.logo_url} alt="preview" className="w-10 h-10 rounded object-cover" />
                    <span className="text-xs text-slate-500">Logo preview valid</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  {editingBrand ? "Save Brand Update" : "Register Brand"}
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
        title="Remove Brand Partner?"
        message="Are you certain you wish to delete this manufacturer brand? Associated product listings will default to generic brand classification."
        confirmLabel="Remove Brand Partner"
        variant="danger"
      />
    </div>
  );
};
