import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("tech_verse_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("tech_verse_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, product.stock_quantity || 99);
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        return [...prev, { ...product, quantity }];
      }
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + (i.price * i.quantity), 0), [items]);

  const value = useMemo(() => ({
    items,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isLoginPromptOpen,
    setIsLoginPromptOpen,
    lastCompletedOrder,
    setLastCompletedOrder,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  }), [items, totalItems, totalPrice, isCartOpen, isCheckoutOpen, isLoginPromptOpen, setIsLoginPromptOpen, lastCompletedOrder, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
