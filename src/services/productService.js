import api from "./api";

export const productService = {
  getProducts: (params) => api.get("/products", { params }).then((r) => r.data),
  getFeatured: () => api.get("/products/featured").then((r) => r.data),
  getProduct: (id) => api.get(`/products/${id}`).then((r) => r.data),
  getRelated: (id) => api.get(`/products/${id}/related`).then((r) => r.data),
  createReview: (id, payload) => api.post(`/products/${id}/reviews`, payload).then((r) => r.data),
  createProduct: (payload) => api.post("/products", payload).then((r) => r.data),
  updateProduct: (id, payload) => api.put(`/products/${id}`, payload).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};

export const categoryService = {
  getCategories: () => api.get("/categories").then((r) => r.data),
};
