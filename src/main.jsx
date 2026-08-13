import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./context/CartContext";
import { LenisScrollProvider } from "./components/layout/LenisScrollProvider";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <LenisScrollProvider>
          <App />
        </LenisScrollProvider>
      </CartProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
