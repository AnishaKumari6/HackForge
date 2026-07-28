import api from "./api";

const registrationService = {
  getMyRegistrations: () => api.get("/registrations/mine").then((r) => r.data),
  getQRCode: (id) => api.get(`/registrations/${id}/qr`).then((r) => r.data),
  checkIn: (id) => api.put(`/registrations/${id}/check-in`).then((r) => r.data),
  cancel: (id) => api.put(`/registrations/${id}/cancel`).then((r) => r.data),
  getForHackathon: (hackathonId, params) => api.get(`/registrations/hackathon/${hackathonId}`, { params }).then((r) => r.data),
  exportCSVUrl: (hackathonId) => `${api.defaults.baseURL}/registrations/hackathon/${hackathonId}/export`,
};

export default registrationService;
