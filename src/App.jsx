import React, { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { scrollToTop } from "./components/layout/LenisScrollProvider";
import { Navbar } from "./components/layout/Navbar";
import { useUrlParams } from "./hooks/useUrlParams";
import { ShowroomCatalog } from "./components/product/ShowroomCatalog";
import { CartDrawer } from "./components/checkout/CartDrawer";
import { CODCheckoutModal } from "./components/checkout/CODCheckoutModal";
import { OrderSuccessModal } from "./components/checkout/OrderSuccessModal";
import { LoginPromptModal } from "./components/auth/LoginPromptModal";
import { Footer } from "./components/layout/Footer";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import VerifyEmailPage from "./components/auth/VerifyEmailPage";
import ProfilePage from "./components/auth/ProfilePage";
import { ProtectedRoute } from "./components/auth/RouteGuards";
import { AdminApp } from "./admin/AdminApp";

export default function App() {
  const isAdminRoute = window.location.pathname.startsWith("/admin");
  if (isAdminRoute) {
    return (
      <AuthProvider>
        <AdminApp />
      </AuthProvider>
    );
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname;
    if (path.includes("/login")) return "login";
    if (path.includes("/register")) return "register";
    if (path.includes("/forgot-password")) return "forgot-password";
    if (path.includes("/reset-password")) return "reset-password";
    if (path.includes("/verify-email") || path.includes("/verify")) return "verify-email";
    if (path.includes("/profile") || path.includes("/account")) return "profile";
    return "home";
  });

  const { updateParams, product: selectedProductSlug } = useUrlParams();

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    if (term) {
      if (currentView !== "home") {
        handleNavigate("home");
      }
      if (selectedProductSlug) {
        updateParams({ product: "" });
      }
    }
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    scrollToTop(false);
    if (view === "home") {
      setSearchTerm("");
      if (window.location.pathname !== "/" || window.location.search !== "") {
        window.history.pushState({ path: "/" }, "", "/");
        window.dispatchEvent(new Event("urlchange"));
        window.dispatchEvent(new Event("popstate"));
      }
    } else {
      let targetPath = "/" + view;
      if (view === "forgot-password") targetPath = "/forgot-password";
      if (view === "reset-password") targetPath = "/reset-password";
      if (view === "verify-email") targetPath = "/verify-email";
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ path: targetPath }, "", targetPath);
        window.dispatchEvent(new Event("urlchange"));
      }
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#f8f2f2] text-[#1d1d1f] selection:bg-[#7b1113] selection:text-white antialiased font-body">
        {/* Edge-to-Edge Showroom Header */}
        <Navbar onSearchChange={handleSearchChange} onNavigate={handleNavigate} />

        {/* Dynamic Content View Area */}
        <main className="flex-1">
          {currentView === "login" && <LoginPage onNavigate={handleNavigate} />}
          {currentView === "register" && <RegisterPage onNavigate={handleNavigate} />}
          {currentView === "forgot-password" && <ForgotPasswordPage onNavigate={handleNavigate} />}
          {currentView === "reset-password" && <ResetPasswordPage onNavigate={handleNavigate} />}
          {currentView === "verify-email" && <VerifyEmailPage onNavigate={handleNavigate} />}
          {currentView === "profile" && (
            <ProtectedRoute>
              <ProfilePage onNavigate={handleNavigate} />
            </ProtectedRoute>
          )}
          {currentView === "home" && <ShowroomCatalog searchTerm={searchTerm} />}
        </main>

        {/* Modals and Side Drawers */}
        <CartDrawer />
        <CODCheckoutModal />
        <OrderSuccessModal />
        <LoginPromptModal />

        {/* Comprehensive Showroom Footer */}
        <Footer onNavigate={handleNavigate} />
      </div>
    </AuthProvider>
  );
}

