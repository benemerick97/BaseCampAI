// frontend/src/utils/axiosInstance.ts

import axios from "axios";

// Force HTTPS on base URL
const rawBaseUrl = import.meta.env.VITE_API_URL;
const baseURL = rawBaseUrl?.replace(/^http:\/\//, "https://");

if (rawBaseUrl !== baseURL) {
  console.warn(
    "[axiosInstance] VITE_API_URL was insecure and has been rewritten to HTTPS:",
    baseURL
  );
}

// Token management
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

// Axios instance
const api = axios.create({
  baseURL,
  withCredentials: true, // required for sending refresh cookies
});

// Attach token to outgoing requests
api.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry logic on 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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

    return Promise.reject(error);
  }
);

export default api;
