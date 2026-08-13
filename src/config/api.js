const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;

export default API_BASE_URL;
