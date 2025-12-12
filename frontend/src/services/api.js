import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000", // backend URL
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ✔ FIXED KEY
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
