import API_BASE_URL from "@/config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Mail, Phone, ShieldCheck, Search as SearchIcon, Key, Edit, Plus, X } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { useAuth } from "../../context/AuthContext";

export const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Provision Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role_id: 1 // Default to Super Admin (1) or Admin (2)
  });

  const { authState, user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/users`, {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [authState.token]);

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/v1/admin/users/${userId}/role`, { role_id: parseInt(newRoleId) }, {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      alert("Role updated successfully.");
      fetchUsers();
    } catch (err) {
      alert("Failed to update role. " + (err.response?.data?.detail || ""));
    }
  };

  const handlePasswordReset = async (userId) => {
    const newPassword = prompt("Enter new password (min 8 chars):");
    if (!newPassword || newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/v1/admin/users/${userId}/reset-password`, { new_password: newPassword }, {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      alert("Password forcibly reset and sessions revoked.");
    } catch (err) {
      alert("Failed to reset password. " + (err.response?.data?.detail || ""));
    }
  };

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/v1/admin/users`, {
        ...formData,
        role_id: parseInt(formData.role_id)
      }, {
        headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
      });
      alert("User provisioned successfully.");
      setIsProvisioning(false);
      setFormData({ full_name: "", email: "", phone: "", password: "", role_id: 1 });
      fetchUsers();
    } catch (err) {
      alert("Failed to provision user. " + (err.response?.data?.detail || ""));
    }
  };

  const columns = [
    {
      key: "full_name",
      header: "User Details",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-800 to-indigo-900 text-white font-extrabold flex items-center justify-center text-sm shadow-2xs">
            {val ? val[0].toUpperCase() : "U"}
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block text-sm">{val}</span>
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400" />
              {row.email}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "role_name",
      header: "Security Role",
      render: (val) => (
        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${val === "Super Admin" ? "bg-purple-100 text-purple-800 border-purple-300" :
          val === "Admin" ? "bg-indigo-100 text-indigo-800 border-indigo-300" :
            "bg-slate-100 text-slate-800 border-slate-300"
          }`}>
          {val}
        </span>
      )
    },
    {
      key: "is_active",
      header: "Status",
      render: (val) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${val ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          }`}>
          {val ? "Active" : "Suspended"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Administrative Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <select
            value={row.role_name}
            onChange={(e) => {
              const roleMap = { "Super Admin": 1, "Admin": 2, "Inventory Manager": 3, "Sales Manager": 4, "Customer": 5 };
              const id = roleMap[e.target.value];
              if (id) handleRoleChange(row.id, id);
            }}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={row.id === currentUser?.id}
          >
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Inventory Manager">Inventory Manager</option>
            <option value="Sales Manager">Sales Manager</option>
            <option value="Customer">Customer</option>
          </select>
          <button
            onClick={() => handlePasswordReset(row.id)}
            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
            title="Force Password Reset"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">System Access & Roles</h1>
          <p className="text-sm text-slate-500 mt-1">Super Admin Dashboard to monitor users, assign roles, and enforce security policies.</p>
        </div>
        <button
          onClick={() => setIsProvisioning(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl shadow-sm text-sm font-extrabold transition"
        >
          <Plus className="w-4 h-4" />
          Provision Team Member
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchPlaceholder="Search by name, email..."
        emptyTitle="No Users Found"
        emptyDescription="Your database has no users."
        exportFileName="mars_multi_users.csv"
      />

      {/* Provision User Modal */}
      {isProvisioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-900">Provision Admin/Staff</h3>
              <button onClick={() => setIsProvisioning(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProvisionUser} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" minLength={8} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Role</label>
                <select value={formData.role_id} onChange={e => setFormData({ ...formData, role_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value={1}>Super Admin</option>
                  <option value={2}>Admin</option>
                  <option value={3}>Inventory Manager</option>
                  <option value={4}>Sales Manager</option>
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-extrabold text-sm rounded-xl transition shadow-sm">
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
