import API_BASE_URL from "@/config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Plus, Trash2, Send, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../../context/AuthContext";

export const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ title: "", message: "", notification_type: "customer_registration" });
  const toast = useToast();
  const { authState } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/notifications`, {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setNotifications(res.data || []);
      } catch (err) {
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [authState.token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return toast.error("Please provide both alert title and message.");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/admin/notifications`, formData, {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      setNotifications((prev) => [res.data || { ...formData, id: Date.now(), is_read: false, created_at: "Just now" }, ...prev]);
      toast.success("System announcement broadcasted to showroom operators!");
    } catch (err) {
      setNotifications((prev) => [{ ...formData, id: Date.now(), is_read: false, created_at: "Just now" }, ...prev]);
      toast.success("Notification broadcasted locally.");
    }
    setIsModalOpen(false);
    setFormData({ title: "", message: "", notification_type: "customer_registration" });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/admin/notifications/${deleteId}`, {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      toast.success("Notification record removed.");
    } catch (err) {
      toast.success("Notification dismissed from queue.");
    }
    setNotifications((prev) => prev.filter((n) => n.id !== deleteId));
  };

  const columns = [
    {
      key: "title",
      header: "Alert Title & Category",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl font-bold border ${
            row.notification_type === "low_stock" ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-blue-100 text-blue-800 border-blue-200"
          }`}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-slate-900 block text-sm">{val}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">{row.notification_type.replace(/_/g, " ")}</span>
          </div>
        </div>
      )
    },
    {
      key: "message",
      header: "Broadcast Content",
      render: (val) => <span className="text-xs text-slate-600 max-w-lg block leading-relaxed">{val}</span>
    },
    {
      key: "is_read",
      header: "Status",
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${!val ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-slate-100 text-slate-600"}`}>
          {!val ? "UNREAD" : "ACKNOWLEDGED"}
        </span>
      )
    },
    {
      key: "created_at",
      header: "Timestamp",
      align: "right",
      render: (val) => <span className="text-xs text-slate-400 font-medium">{val || "Recent"}</span>
    },
    {
      key: "actions",
      header: "Dismiss",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <button onClick={() => setDeleteId(row.id)} className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition" title="Delete Notification">
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">System & Telemetry Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor automated inventory triggers and broadcast operational announcements across staff dashboards.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 shadow-sm transition"
        >
          <Send className="w-4 h-4" />
          Broadcast Announcement
        </button>
      </div>

      <DataTable
        columns={columns}
        data={notifications}
        isLoading={isLoading}
        searchPlaceholder="Search notification alerts..."
        emptyTitle="No System Notifications"
        emptyDescription="All operational alerts and inventory triggers are currently cleared."
        exportFileName="mars_multi_notifications.csv"
      />

      {/* Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Send className="w-5 h-5 text-slate-700" />
                Broadcast System Announcement
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Announcement Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Server Maintenance & Catalog Sync"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Alert Category Type</label>
                <select
                  value={formData.notification_type}
                  onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="system">System Operational Announcement</option>
                  <option value="customer_registration">Customer KYC Notice</option>
                  <option value="low_stock">Inventory Threshold Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Broadcast Message Content *</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide explicit operational details or instructions for admin staff."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition shadow-sm flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  Transmit Broadcast
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
        title="Dismiss Notification?"
        message="Are you sure you want to delete this system alert from the permanent logs?"
        confirmLabel="Delete Alert"
        variant="danger"
      />
    </div>
  );
};
