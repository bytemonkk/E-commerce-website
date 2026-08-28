import axios from "axios";

/**
 * Single Axios instance used across the app. Centralizing this means
 * auth headers, base URL, and error normalization live in one place
 * instead of being repeated in every component.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true, // sends the httpOnly JWT cookie automatically
  timeout: 15000,
});

// Attach bearer token (if stored) to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize error responses so components can rely on a consistent shape
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong. Please try again.";

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Avoid redirect loop if already on the login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ ...error, message });
  }
);

export default api;
