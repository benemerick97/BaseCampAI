// frontend/src/utils/axiosInstance.ts

import axios from "axios";

// Force HTTPS if needed
const rawBaseUrl = import.meta.env.VITE_API_URL;
const baseURL = rawBaseUrl?.startsWith("https://")
  ? rawBaseUrl
  : rawBaseUrl?.replace(/^http:\/\//, "https://");

if (rawBaseUrl !== baseURL) {
  console.warn("[axiosInstance] VITE_API_URL was insecure. Rewritten to:", baseURL);
}

// Access token (in-memory + localStorage)
let accessToken: string | null = localStorage.getItem("token") || null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;

  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

const api = axios.create({
  baseURL,
  withCredentials: true, // Needed for refresh token cookie
});

// Inject access token
api.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry with refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data.access_token;
        setAccessToken(newToken);

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        }

        return api(originalRequest);
      } catch (refreshErr) {
        setAccessToken(null);
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
