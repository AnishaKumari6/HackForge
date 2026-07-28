import api from "./api";

const submissionService = {
  upsert: (teamId, payload) => api.post(`/submissions/team/${teamId}`, payload).then((r) => r.data),
  finalize: (id) => api.put(`/submissions/${id}/submit`).then((r) => r.data),
  uploadImages: (id, formData) =>
    api.put(`/submissions/${id}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  deleteImage: (id, imageId) => api.delete(`/submissions/${id}/images/${imageId}`).then((r) => r.data),
  uploadPdf: (id, formData) =>
    api.put(`/submissions/${id}/pdf`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  uploadVideo: (id, formData) =>
    api.put(`/submissions/${id}/video`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  getSubmission: (id) => api.get(`/submissions/${id}`).then((r) => r.data),
  getMine: (hackathonId) => api.get(`/submissions/mine/${hackathonId}`).then((r) => r.data),
  getForHackathon: (hackathonId, params) => api.get(`/submissions/hackathon/${hackathonId}`, { params }).then((r) => r.data),
  getGallery: (params) => api.get("/submissions/gallery", { params }).then((r) => r.data),
};

export default submissionService;
