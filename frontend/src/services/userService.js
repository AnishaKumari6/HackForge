import api from "./api";

const userService = {
  updateProfile: (payload) => api.put("/users/profile", payload).then((r) => r.data),
  updateAvatar: (formData) =>
    api.put("/users/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  getUserProfile: (id) => api.get(`/users/${id}`).then((r) => r.data),
  listJudges: () => api.get("/users/judges").then((r) => r.data),
  getAllUsers: (params) => api.get("/users", { params }).then((r) => r.data),
  blockUser: (id, reason) => api.put(`/users/${id}/block`, { reason }).then((r) => r.data),
  unblockUser: (id) => api.put(`/users/${id}/unblock`).then((r) => r.data),
  changeUserRole: (id, role) => api.put(`/users/${id}/role`, { role }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};

export default userService;
