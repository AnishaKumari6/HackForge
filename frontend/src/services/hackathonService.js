import api from "./api";

const hackathonService = {
  getHackathons: (params) => api.get("/hackathons", { params }).then((r) => r.data),
  getFeatured: () => api.get("/hackathons/featured").then((r) => r.data),
  getTrending: () => api.get("/hackathons/trending").then((r) => r.data),
  getPublicStats: () => api.get("/hackathons/stats").then((r) => r.data),
  getMyHackathons: (params) => api.get("/hackathons/mine/list", { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/hackathons/${slug}`).then((r) => r.data),
  create: (payload) => api.post("/hackathons", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/hackathons/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/hackathons/${id}`).then((r) => r.data),
  updateBanner: (id, formData) =>
    api.put(`/hackathons/${id}/banner`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  publish: (id) => api.put(`/hackathons/${id}/publish`).then((r) => r.data),
  assignJudges: (id, judgeIds) => api.put(`/hackathons/${id}/judges`, { judgeIds }).then((r) => r.data),
  publishResults: (id) => api.put(`/hackathons/${id}/publish-results`).then((r) => r.data),
  toggleFeatured: (id) => api.put(`/hackathons/${id}/feature`).then((r) => r.data),
};

export default hackathonService;
