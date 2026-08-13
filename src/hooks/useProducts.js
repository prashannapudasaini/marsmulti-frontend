import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: productService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useProducts(filters = {}) {
  const { category, search, sort, featured } = filters;
  
  return useQuery({
    queryKey: ["products", { category, search, sort, featured }],
    queryFn: () => productService.getProducts({ category, search, sort, featured }),
    staleTime: 60 * 1000, // 1 minute cache
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useProductDetail(slug, enabled = true) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getProductBySlug(slug),
    enabled: Boolean(slug) && enabled,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
