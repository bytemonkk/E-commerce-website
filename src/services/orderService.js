import api from "./api";

export const orderService = {
  getMyOrders: () => api.get("/orders/my-orders").then((r) => r.data),
  getOrder: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  getAllOrders: (params) => api.get("/orders", { params }).then((r) => r.data),
  updateStatus: (id, payload) => api.patch(`/orders/${id}/status`, payload).then((r) => r.data),
  getAnalytics: (days = 30) => api.get("/orders/analytics/summary", { params: { days } }).then((r) => r.data),
};

export const paymentService = {
  getClientToken: () => api.get("/payments/client-token").then((r) => r.data),
  checkout: (payload) => api.post("/payments/checkout", payload).then((r) => r.data),
};
