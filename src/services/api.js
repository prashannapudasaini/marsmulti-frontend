import { CONFIG } from "../constants/config";

export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

let isOffline = false;

export const api = {
  async get(endpoint, params = {}) {
    if (isOffline) {
      throw new ApiError(0, "Backend API offline (using local fallback inventory).", null);
    }
    const url = new URL(`${CONFIG.API_BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        url.searchParams.append(key, val);
      }
    });

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.detail || "Failed to retrieve requested data from server.",
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (!(error instanceof ApiError) || error.status === 0) {
        isOffline = true;
      }
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        0,
        "Unable to connect to the backend API server (http://localhost:8000). Using local fallback catalog.",
        null
      );
    }
  },

  async post(endpoint, body) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.detail || "Failed to submit request to server.",
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        0,
        "Unable to reach backend checkout server. Please ensure FastAPI server is running on port 8000.",
        null
      );
    }
  },

  async delete(endpoint) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.detail || "Delete request failed.", errorData);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, "Backend API connection failed.", null);
    }
  },

  async patch(endpoint, body) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.detail || "Patch update failed.", errorData);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, "Backend API connection failed.", null);
    }
  }
};
