import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000", // backend URL
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const path = window.location.pathname;

  let token = null;

  if (path.startsWith("/admin")) token = localStorage.getItem("adminToken");
  if (path.startsWith("/technician")) token = localStorage.getItem("techToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
