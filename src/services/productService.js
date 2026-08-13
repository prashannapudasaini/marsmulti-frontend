import { api } from "./api";

export const productService = {
  getCategories: async () => {
    try {
      const data = await api.get("/categories");
      return data || [];
    } catch (err) {
      console.error("Failed to fetch categories from database:", err);
      return [];
    }
  },
  
  getProducts: async ({ category = "", search = "", sort = "", featured = false } = {}) => {
    try {
      const params = {};
      if (category && category !== "all") params.category_slug = category;
      if (search) params.q = search;
      if (sort) params.sort_by = sort;
      if (featured) params.featured = true;

      const data = await api.get("/products", params);
      return data || [];
    } catch (err) {
      console.error("Failed to fetch products from database:", err);
      return [];
    }
  },

  getProductBySlug: async (slug) => {
    try {
      const data = await api.get(`/products/${slug}`);
      return data || null;
    } catch (err) {
      console.error(`Failed to fetch product '${slug}' from database:`, err);
      return null;
    }
  },

  getProductReviews: async (productId) => {
    try {
      const data = await api.get(`/products/${productId}/reviews`);
      return data || { reviews: [], average_rating: 5.0, total_reviews: 0 };
    } catch (err) {
      console.error("Failed to fetch product reviews:", err);
      return { reviews: [], average_rating: 5.0, total_reviews: 0 };
    }
  },

  submitReview: async (productId, reviewData) => {
    return await api.post(`/products/${productId}/reviews`, reviewData);
  },
};
