import api from "./api";

export const getAllUsers = () => api.get("/users");

export const updateUser = (id, data) => api.put(`/users/${id}`, data);

export const deleteUser = (id) => api.delete(`/users/${id}`);
