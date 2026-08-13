import API_BASE_URL from "@/config/api";
import axios from "axios";

const authClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically inject Bearer JWT access token
authClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatic 401 handling & Refresh Token Rotation
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not intercept refresh or login attempts themselves
    if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem("refresh_token");

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: storedRefreshToken },
          { withCredentials: true }
        );

        if (res.status === 200) {
          const { access_token, refresh_token, user } = res.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          if (user) {
            localStorage.setItem("auth_user", JSON.stringify(user));
          }

          authClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          processQueue(null, access_token);
          return authClient(originalRequest);
        }
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("auth_user");
        window.dispatchEvent(new CustomEvent("auth-logout"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth Service Endpoints
export const authService = {
  login: async (email, password) => {
    const response = await authClient.post("/auth/login", { email, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await authClient.post("/auth/register", userData);
    return response.data;
  },
  googleLogin: async (credential) => {
    const response = await authClient.post("/auth/google", { credential });
    return response.data;
  },
  logout: async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    try {
      await authClient.post("/auth/logout", { refresh_token: refreshToken });
    } catch (e) {
      console.warn("Logout endpoint error handled gracefully:", e);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_user");
    }
  },
  getCurrentUser: async () => {
    const response = await authClient.get("/auth/me");
    return response.data;
  },
  verifyEmail: async (token) => {
    const response = await authClient.post("/auth/verify-email", { token });
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await authClient.post("/auth/forgot-password", { email });
    return response.data;
  },
  resetPassword: async (token, new_password) => {
    const response = await authClient.post("/auth/reset-password", { token, new_password });
    return response.data;
  },
  changePassword: async (current_password, new_password) => {
    const response = await authClient.post("/auth/change-password", { current_password, new_password });
    return response.data;
  },
};

export default authClient;
