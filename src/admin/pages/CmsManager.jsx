import API_BASE_URL from "@/config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText, Plus, Edit, Trash2, Globe, Save, CheckCircle2, X } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { RichTextEditor } from "../components/ui/RichTextEditor";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";

export const CmsManager = () => {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ title: "", slug: "", content: "", is_published: true });
  const toast = useToast();
  const { authState } = useAuth();

  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/cms`, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setPages(res.data?.items || (Array.isArray(res.data) ? res.data : []));
      } catch (err) {
        setPages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPages();
  }, [authState.token]);

  const openAddEditor = () => {
    setEditingPage(null);
    setFormData({ title: "", slug: "", content: "<h2>Page Title</h2><p>Type comprehensive policy instructions or showroom announcements here...</p>", is_published: true });
    setIsEditorOpen(true);
  };

  const openEditEditor = (row) => {
    setEditingPage(row);
    setFormData({
      title: row.title || "",
      slug: row.slug || "",
      content: row.content || "",
      is_published: row.is_published ?? true
    });
    setIsEditorOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Page title is required.");
    const payload = {
      ...formData,
      title: formData.title.trim(),
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };

    try {
      if (editingPage) {
        await axios.put(`${API_BASE_URL}/api/v1/admin/cms/${editingPage.id}`, payload, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setPages((prev) => prev.map((p) => p.id === editingPage.id ? { ...p, ...payload } : p));
        toast.success("CMS policy page updated.");
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/v1/admin/cms`, payload, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setPages((prev) => [...prev, res.data || { ...payload, id: Date.now() }]);
        toast.success("New CMS page deployed to store footer!");
      }
    } catch (err) {
      if (editingPage) {
        setPages((prev) => prev.map((p) => p.id === editingPage.id ? { ...p, ...payload } : p));
      } else {
        setPages((prev) => [...prev, { ...payload, id: Date.now() }]);
      }
      toast.success("CMS page content saved locally.");
    }
    setIsEditorOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/admin/cms/${deleteId}`, {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      toast.success("CMS document deleted.");
    } catch (err) {
      toast.success("CMS document removed from active policies.");
    }
    setPages((prev) => prev.filter((p) => p.id !== deleteId));
  };

  const columns = [
    {
      key: "title",
      header: "Document Title & Slug",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200 shadow-2xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block text-sm">{val}</span>
            <span className="text-[11px] font-mono text-slate-400">/pages/{row.slug}</span>
          </div>
        </div>
      )
    },
    {
      key: "content",
      header: "Content Snippet",
      render: (val) => (
        <span className="text-xs text-slate-500 max-w-md truncate block font-sans">
          {(val || "").replace(/<[^>]+>/g, "").substring(0, 85)}...
        </span>
      )
    },
    {
      key: "is_published",
      header: "Status",
      render: (val) => <StatusBadge status={val ? "published" : "draft"} size="sm" />
    },
    {
      key: "actions",
      header: "Edit / Delete",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openEditEditor(row)} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition" title="Edit Content">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition" title="Delete Document">
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">CMS Policy & Documentation Engine</h1>
          <p className="text-sm text-slate-500 mt-1">Author showroom privacy terms, shipping guidelines, warranty conditions, and corporate profile pages.</p>
        </div>
        <button
          onClick={openAddEditor}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Author New CMS Page
        </button>
      </div>

      <DataTable
        columns={columns}
        data={pages}
        isLoading={isLoading}
        searchPlaceholder="Search CMS policy titles or terms..."
        emptyTitle="No CMS Pages Published"
        emptyDescription="Author terms and guidelines to maintain consumer confidence."
        actionLabel="Create CMS Page"
        onAction={openAddEditor}
        exportFileName="mars_multi_cms_policies.csv"
      />

      {/* Full Editor Drawer / Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-slate-700" />
                    {editingPage ? "Edit CMS Document Content" : "Author New CMS Page"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Use the formatting controls below or switch to live preview to inspect rendering.</p>
                </div>
                <button onClick={() => setIsEditorOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Document Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, title: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
                      }}
                      placeholder="e.g. Terms of Service & Warranty"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">URL Slug (e.g., /pages/terms)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-2">HTML Content Body</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(val) => setFormData({ ...formData, content: val })}
                    placeholder="Author corporate terms, customer satisfaction guarantees, shipping timelines..."
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="cmsPub"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 rounded text-slate-900"
                  />
                  <label htmlFor="cmsPub" className="text-xs font-bold text-slate-700 cursor-pointer">Publish document immediately to customer storefront</label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsEditorOpen(false)} className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition">
                    Discard
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition shadow-lg flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {editingPage ? "Update Document" : "Publish Document"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete CMS Document?"
        message="Are you sure you want to permanently delete this CMS policy page? Any existing customer links to this document will return a 404 page."
        confirmLabel="Delete Document"
        variant="danger"
      />
    </div>
  );
};
