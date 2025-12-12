import api from "./api";

export const addRating = (data) => api.post("/ratings", data);
export const updateRating = (id, data) => api.put(`/ratings/${id}`, data);
export const deleteRating = (id) => api.delete(`/ratings/${id}`);
export const getRatingsByStore = (storeId) =>
  api.get(`/ratings/store/${storeId}`);
