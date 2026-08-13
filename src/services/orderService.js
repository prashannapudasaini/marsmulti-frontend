import { api } from "./api";

export const orderService = {
  createCODOrder: (orderPayload) => api.post("/orders/cod", orderPayload),
  createUnifiedOrder: (orderPayload) => api.post("/checkout/unified", orderPayload),
  verifyPaymentCallback: (gateway, payload) => api.post(`/payments/verify/${gateway}`, payload),
  getShippingRates: () => api.get("/shipping/rates"),
  getTaxRules: () => api.get("/tax/rules"),
  getOrderStatus: (orderNumber) => api.get(`/orders/${orderNumber}`),
};
