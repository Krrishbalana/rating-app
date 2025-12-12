import api from "./api";

export const createStore = (data) => api.post("/stores", data);
export const getAllStores = () => api.get("/stores");
export const getStoreById = (id) => api.get(`/stores/${id}`);
export const updateStore = (id, data) => api.put(`/stores/${id}`, data);
export const deleteStore = (id) => api.delete(`/stores/${id}`);
