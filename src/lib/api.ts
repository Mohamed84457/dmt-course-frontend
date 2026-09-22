import axios from "axios";

const getApiBaseUrl = () => {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://dmt-course.vercel.app/api";
  const cleanUrl = rawUrl.replace(/\/+$/, "");
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Request interceptor to attach JWT Bearer token on every API call
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      let token: string | null = localStorage.getItem("accessToken");
      if (!token || token === "undefined" || token === "null") {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed && typeof parsed.accessToken === "string" && parsed.accessToken) {
              const userToken: string = parsed.accessToken;
              localStorage.setItem("accessToken", userToken);
              token = userToken;
            }
          }
        } catch (e) {}
      }
      if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token.trim()}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh & error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );
        const newToken =
          refreshResponse.data?.token ||
          refreshResponse.data?.accessToken ||
          refreshResponse.data?.data?.token ||
          refreshResponse.data?.data?.accessToken;

        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      }
    }
    return Promise.reject(error);
  }
);
