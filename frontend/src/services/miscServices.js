import api from "./api";

export const notificationService = {
  getMine: (params) => api.get("/notifications", { params }).then((r) => r.data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () => api.put("/notifications/read-all").then((r) => r.data),
  remove: (id) => api.delete(`/notifications/${id}`).then((r) => r.data),
};

export const bookmarkService = {
  toggle: (hackathonId) => api.put(`/bookmarks/${hackathonId}/toggle`).then((r) => r.data),
  getMine: () => api.get("/bookmarks").then((r) => r.data),
};

export const adminService = {
  getDashboard: () => api.get("/admin/dashboard").then((r) => r.data),
  getMonthlyGrowth: () => api.get("/admin/analytics/monthly-growth").then((r) => r.data),
  getActivityLogs: (params) => api.get("/admin/activity-logs", { params }).then((r) => r.data),
  getReports: () => api.get("/admin/reports").then((r) => r.data),
};
