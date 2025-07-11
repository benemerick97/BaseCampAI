// frontend/src/utils/axiosInstance.ts

import axios from "axios";

// ✅ Force HTTPS if accidentally using HTTP in the env var
const rawBaseUrl = import.meta.env.VITE_API_URL;
const baseURL = rawBaseUrl?.replace(/^http:\/\//, "https://");

if (rawBaseUrl !== baseURL) {
  console.warn(
    "[axiosInstance] VITE_API_URL was insecure and has been rewritten to use HTTPS:",
    baseURL
  );
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${baseURL}/auth/refresh`,  // ✅ Use patched baseURL here too
          {},
          { withCredentials: true }
        );
        const newAccessToken = refreshRes.data.access_token;
        localStorage.setItem("token", newAccessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
