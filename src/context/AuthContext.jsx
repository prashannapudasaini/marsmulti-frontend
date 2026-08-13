import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("auth_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const syncProfile = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile);
      localStorage.setItem("auth_user", JSON.stringify(profile));
    } catch (err) {
      console.warn("Failed to synchronize user session from backend:", err);
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncProfile();

    const handleLogoutEvent = () => {
      setUser(null);
    };
    window.addEventListener("auth-logout", handleLogoutEvent);
    return () => window.removeEventListener("auth-logout", handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.detail || "Unable to login. Please verify your credentials or check connection.";
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await authService.register(userData);
      return { success: true, message: res.message };
    } catch (err) {
      const message = err.response?.data?.detail || "Registration failed. Please try again.";
      setError(message);
      return { success: false, message };
    }
  };

  const googleLogin = async (credential) => {
    setError(null);
    try {
      const data = await authService.googleLogin(credential);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.detail || "Google OAuth sign-in failed.";
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const currentToken = localStorage.getItem("access_token");
  const value = {
    user,
    token: currentToken,
    authState: { token: currentToken, user, isAuthenticated: !!user },
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role_name === "Admin" || user?.role_name === "Super Admin",
    isStaff: ["Super Admin", "Admin", "Inventory Manager", "Sales Manager"].includes(user?.role_name),
    role: user?.role_name || "Guest",
    login,
    register,
    googleLogin,
    logout,
    refreshUser: syncProfile,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
