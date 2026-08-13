import { useState, useEffect, useCallback } from "react";
import { scrollToTop } from "../components/layout/LenisScrollProvider";

/**
 * Custom hook to cleanly read and sync URL search parameters (?category=slug, ?product=slug)
 * without triggering full page reloads, ensuring shareable links and seamless 60 FPS rendering.
 */
export function useUrlParams() {
  const [params, setParams] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      category: searchParams.get("category") || "",
      product: searchParams.get("product") || "",
      search: searchParams.get("search") || "",
      sort: searchParams.get("sort") || "",
    };
  });

  // Listen to browser popstate and custom urlchange events across all components
  useEffect(() => {
    const handleUrlSync = () => {
      const searchParams = new URLSearchParams(window.location.search);
      setParams({
        category: searchParams.get("category") || "",
        product: searchParams.get("product") || "",
        search: searchParams.get("search") || "",
        sort: searchParams.get("sort") || "",
      });
    };

    window.addEventListener("popstate", handleUrlSync);
    window.addEventListener("urlchange", handleUrlSync);
    return () => {
      window.removeEventListener("popstate", handleUrlSync);
      window.removeEventListener("urlchange", handleUrlSync);
    };
  }, []);

  /**
   * Updates specific parameter keys in the URL without a page reload and dispatches event
   * to keep all components completely synchronized.
   */
  const updateParams = useCallback((newParams) => {
    const searchParams = new URLSearchParams(window.location.search);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });

    const newSearch = searchParams.toString();
    const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;

    window.history.pushState({ path: newUrl }, "", newUrl);
    window.dispatchEvent(new Event("urlchange"));
    scrollToTop(false);

    setParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  }, []);

  return {
    category: params.category,
    product: params.product,
    search: params.search,
    sort: params.sort,
    updateParams,
  };
}
