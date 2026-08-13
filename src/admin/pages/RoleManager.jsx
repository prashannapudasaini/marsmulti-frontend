import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShieldCheck, Lock, CheckCircle2, Key, UserCheck, AlertTriangle } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { useAuth } from "../../context/AuthContext";

export const RoleManager = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/api/v1/admin/roles", {
          headers: { Authorization: `Bearer ${authState.token || localStorage.getItem("access_token")}` }
        });
        setRoles(res.data?.items || (Array.isArray(res.data) ? res.data : []));
      } catch (err) {
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, [authState.token]);

  const columns = [
    {
      key: "name",
      header: "System Role Designation",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400 font-black border border-slate-800 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-slate-900 block text-sm">{val}</span>
            <span className="text-[11px] font-mono text-slate-400">ID: ROLE_{row.id}</span>
          </div>
        </div>
      )
    },
    {
      key: "description",
      header: "Governance & Scope",
      render: (val) => <span className="text-xs text-slate-600 max-w-sm block leading-relaxed">{val}</span>
    },
    {
      key: "permissions",
      header: "Granted API Permissions",
      render: (val) => (
        <div className="flex flex-wrap gap-1 max-w-md">
          {(val || ["Standard Read/Write"]).map((p, i) => (
            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md border border-slate-200">
              {p}
            </span>
          ))}
        </div>
      )
    },
    {
      key: "users_count",
      header: "Assigned Profiles",
      align: "right",
      render: (val) => <span className="px-3 py-1 bg-amber-100 text-amber-900 font-black rounded-full text-xs">{val || 0} Accounts</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">RBAC Role & Access Management</h1>
          <p className="text-sm text-slate-500 mt-1">Govern principle-of-least-privilege access across the backend API and frontend admin modules.</p>
        </div>
        <div className="px-4 py-2 bg-slate-900 text-amber-400 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm">
          <Lock className="w-4 h-4" />
          JWT Role Enforced
        </div>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        searchPlaceholder="Search system role designations or access scopes..."
        emptyTitle="No System Roles Found"
        emptyDescription="System roles will synchronize automatically from backend authentication schemas."
        exportFileName="mars_multi_rbac_roles.csv"
      />
    </div>
  );
};
