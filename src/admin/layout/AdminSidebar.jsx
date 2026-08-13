import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Package, Tag, Layers, ShoppingBag, Users, Heart,
  ShoppingCart, Eye, Ticket, Image as ImageIcon, FileText, Bell,
  Activity, BarChart2, ShieldCheck, Settings, ChevronLeft, ChevronRight, Store
} from "lucide-react";

export const AdminSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  const { user } = useAuth();
  const roleName = user?.role_name || "Staff";

  const rawMenuSections = [
    {
      title: "OVERVIEW",
      allowedRoles: ["Super Admin", "Admin", "Sales Manager", "Staff"],
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      ]
    },
    {
      title: "INVENTORY",
      allowedRoles: ["Super Admin", "Admin", "Inventory Manager", "Staff"],
      items: [
        { name: "Products", path: "/admin/products", icon: Package },
        { name: "Categories", path: "/admin/categories", icon: Layers },
        { name: "Brands", path: "/admin/brands", icon: Tag },
      ]
    },
    {
      title: "SALES",
      allowedRoles: ["Super Admin", "Admin", "Sales Manager", "Staff"],
      items: [
        { name: "Orders", path: "/admin/orders", icon: ShoppingBag, badge: "Live" },
      ]
    },
    {
      title: "USERS",
      allowedRoles: ["Super Admin", "Admin"],
      items: [
        { name: "Customers", path: "/admin/customers", icon: Users },
      ]
    },
    {
      title: "TEAM",
      allowedRoles: ["Super Admin"],
      items: [
        { name: "User Management", path: "/admin/users", icon: ShieldCheck },
      ]
    },
    {
      title: "SYSTEM",
      allowedRoles: ["Super Admin", "Admin"],
      items: [
        { name: "Settings", path: "/admin/settings", icon: Settings },
      ]
    }
  ];

  const menuSections = rawMenuSections.filter(section => section.allowedRoles.includes(roleName));



  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-950 text-slate-300 transition-all duration-300 flex flex-col border-r border-slate-800/80 shadow-2xl ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand & Showroom Toggle Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0 bg-slate-900/50">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 font-mono tracking-wider font-extrabold text-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white font-sans text-lg font-black shadow-lg">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white leading-none">Admin Panel</span>
              <span className="text-[10px] text-amber-400 font-sans tracking-normal mt-0.5">Store Management</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white font-sans text-lg font-black shadow-lg">
            M
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition hidden sm:flex border border-slate-800"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed ? (
              <div className="px-3 mb-2 text-[11px] font-black uppercase tracking-wider text-slate-500">
                {section.title}
              </div>
            ) : (
              <div className="w-6 h-px bg-slate-800 mx-auto mb-2" />
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition group relative ${
                      isActive
                        ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10"
                        : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-amber-500 rounded-r-full" />
                    )}
                    <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-amber-400 stroke-[2.5]" : "text-slate-400"
                    }`} />
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Showroom Storefront Return Link */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-slate-800/60 hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition border border-slate-700/50"
        >
          <Store className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>View Storefront</span>}
        </a>
      </div>
    </aside>
  );
};
