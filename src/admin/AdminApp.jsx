import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./layout/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { ProductList } from "./pages/ProductList";
import { ProductForm } from "./pages/ProductForm";
import { CategoryManager } from "./pages/CategoryManager";
import { BrandManager } from "./pages/BrandManager";
import { OrderManager } from "./pages/OrderManager";
import { CustomerManager } from "./pages/CustomerManager";
import { UserManager } from "./pages/UserManager";
import { SystemSettings } from "./pages/SystemSettings";
import { AdminRoute, RoleProtectedRoute } from "../components/auth/RouteGuards";

export const AdminApp = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect base /admin directly to Executive Dashboard */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Main Admin Layout & Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          

          {/* Hardware Catalog */}
          <Route path="products" element={<RoleProtectedRoute allowedRoles={["Super Admin", "Admin", "Inventory Manager", "Staff"]}><ProductList /></RoleProtectedRoute>} />
          <Route path="products/new" element={<RoleProtectedRoute allowedRoles={["Super Admin", "Admin", "Inventory Manager", "Staff"]}><ProductForm /></RoleProtectedRoute>} />
          <Route path="products/:id/edit" element={<RoleProtectedRoute allowedRoles={["Super Admin", "Admin", "Inventory Manager", "Staff"]}><ProductForm /></RoleProtectedRoute>} />
          <Route path="categories" element={<RoleProtectedRoute allowedRoles={["Super Admin", "Admin", "Inventory Manager", "Staff"]}><CategoryManager /></RoleProtectedRoute>} />
          <Route path="brands" element={<RoleProtectedRoute allowedRoles={["Super Admin", "Admin", "Inventory Manager", "Staff"]}><BrandManager /></RoleProtectedRoute>} />

          {/* Business Operations */}
          <Route path="orders" element={<RoleProtectedRoute allowedRoles={["Super Admin", "Admin", "Sales Manager", "Staff"]}><OrderManager /></RoleProtectedRoute>} />
          <Route path="orders/:id" element={<RoleProtectedRoute allowedRoles={["Super Admin", "Admin", "Sales Manager", "Staff"]}><OrderManager /></RoleProtectedRoute>} />
          <Route path="customers" element={<RoleProtectedRoute allowedRoles={["Super Admin", "Admin"]}><CustomerManager /></RoleProtectedRoute>} />
          <Route path="users" element={<RoleProtectedRoute allowedRoles={["Super Admin"]}><UserManager /></RoleProtectedRoute>} />

          {/* System Control */}
          <Route path="settings" element={<RoleProtectedRoute allowedRoles={["Super Admin", "Admin"]}><SystemSettings /></RoleProtectedRoute>} />

          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};
