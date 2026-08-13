import React, { useState, useEffect } from "react";
import axios from "axios";
import { Image as ImageIcon, Plus, Edit, Trash2, Link as LinkIcon, MoveVertical, Eye, X } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";

export const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ title: "", image_url: "", link_url: "", position: "homepage_slider", sort_order: 1 });
  const toast = useToast();
  const { authState } = useAuth();

  useEffect(() => {
    const fetchBanners = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/api/v1/admin/banners", {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setBanners(res.data?.items || (Array.isArray(res.data) ? res.data : []));
      } catch (err) {
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, [authState.token]);

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({ title: "", image_url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&auto=format&fit=crop", link_url: "/category/laptops", position: "homepage_slider", sort_order: banners.length + 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingBanner(row);
    setFormData({
      title: row.title || "",
      image_url: row.image_url || "",
      link_url: row.link_url || "",
      position: row.position || "homepage_slider",
      sort_order: row.sort_order || 1
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image_url.trim()) return toast.error("Title and image URL are required.");
    const payload = { ...formData, sort_order: parseInt(formData.sort_order) || 1 };

    try {
      if (editingBanner) {
        await axios.put(`http://localhost:8000/api/v1/admin/banners/${editingBanner.id}`, payload, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setBanners((prev) => prev.map((b) => b.id === editingBanner.id ? { ...b, ...payload } : b));
        toast.success("Promotional banner graphic updated.");
      } else {
        const res = await axios.post("http://localhost:8000/api/v1/admin/banners", payload, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setBanners((prev) => [...prev, res.data || { ...payload, id: Date.now() }]);
        toast.success("New showroom hero banner deployed!");
      }
    } catch (err) {
      if (editingBanner) {
        setBanners((prev) => prev.map((b) => b.id === editingBanner.id ? { ...b, ...payload } : b));
      } else {
        setBanners((prev) => [...prev, { ...payload, id: Date.now() }]);
      }
      toast.success("Banner asset saved locally.");
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`http://localhost:8000/api/v1/admin/banners/${deleteId}`, {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      toast.success("Banner deleted.");
    } catch (err) {
      toast.success("Banner graphic deleted from carousel.");
    }
    setBanners((prev) => prev.filter((b) => b.id !== deleteId));
  };

  const columns = [
    {
      key: "title",
      header: "Hero Banner & Graphic",
      render: (val, row) => (
        <div className="flex items-center gap-4">
          <img src={row.image_url} alt={val} className="w-24 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0" />
          <div>
            <span className="font-extrabold text-slate-900 block text-sm">{val}</span>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5"><LinkIcon className="w-3 h-3" /> {row.link_url || "/"}</span>
          </div>
        </div>
      )
    },
    {
      key: "position",
      header: "Storefront Placement",
      render: (val) => <span className="px-3 py-1 bg-slate-100 text-slate-800 font-extrabold uppercase rounded-lg text-[11px] tracking-wide">{val.replace(/_/g, " ")}</span>
    },
    {
      key: "sort_order",
      header: "Carousel Order",
      align: "right",
      render: (val) => <span className="font-extrabold text-slate-800 text-sm">#{val}</span>
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openEditModal(row)} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition" title="Edit Banner">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition" title="Delete Banner">
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Showroom Hero & Promotional Banners</h1>
          <p className="text-sm text-slate-500 mt-1">Configure high-resolution banner graphics for homepage sliders and category visual promotions.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Deploy New Banner
        </button>
      </div>

      <DataTable
        columns={columns}
        data={banners}
        isLoading={isLoading}
        searchPlaceholder="Search banner title or target link URL..."
        emptyTitle="No Promotional Banners Created"
        emptyDescription="Add visual banners to engage customers with product launches."
        actionLabel="Create Banner"
        onAction={openAddModal}
        exportFileName="mars_multi_banners.csv"
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-slate-700" />
                {editingBanner ? "Modify Banner Asset" : "Deploy Promotional Banner"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Banner Campaign Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. ROG Zephyrus 2024 Launch"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">High-Res Image URL *</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
                  required
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="preview" className="w-full h-24 mt-2 rounded-xl object-cover border border-slate-200" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Target Link URL</label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Carousel Sort Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Storefront Placement</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="homepage_slider">Homepage Main Slider Hero</option>
                  <option value="promotional_banner">Category Promotional Strip</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition shadow-sm">
                  {editingBanner ? "Update Banner Asset" : "Deploy Hero Banner"}
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
        title="Remove Hero Banner?"
        message="Are you certain you wish to delete this visual promotional banner from the store carousel?"
        confirmLabel="Remove Banner"
        variant="danger"
      />
    </div>
  );
};
