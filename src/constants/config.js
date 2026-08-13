import API_BASE_URL from "@/config/api";
export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || `${API_BASE_URL}/api/v1`,
  SITE_NAME: "Mars Multi",
  SITE_TAGLINE: "Tech that powers your world",
  WHATSAPP_SUPPORT_NUMBER: "+9779849025283",
  CURRENCY_CODE: "NPR",
  CURRENCY_SYMBOL: "NPR ",
};
