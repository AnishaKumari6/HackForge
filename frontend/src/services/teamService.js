import api from "./api";

const teamService = {
  createTeam: (payload) => api.post("/teams", payload).then((r) => r.data),
  getTeam: (id) => api.get(`/teams/${id}`).then((r) => r.data),
  getMyTeamForHackathon: (hackathonId) => api.get(`/teams/mine/${hackathonId}`).then((r) => r.data),
  inviteMember: (id, email) => api.post(`/teams/${id}/invite`, { email }).then((r) => r.data),
  acceptInvite: (token) => api.put(`/teams/invite/${token}/accept`).then((r) => r.data),
  declineInvite: (token) => api.put(`/teams/invite/${token}/decline`).then((r) => r.data),
  leaveTeam: (id) => api.put(`/teams/${id}/leave`).then((r) => r.data),
  transferLeadership: (id, newLeaderId) => api.put(`/teams/${id}/transfer-leadership`, { newLeaderId }).then((r) => r.data),
  submitForApproval: (id) => api.put(`/teams/${id}/submit`).then((r) => r.data),
  deleteTeam: (id) => api.delete(`/teams/${id}`).then((r) => r.data),
  getTeamsForHackathon: (hackathonId, params) => api.get(`/teams/hackathon/${hackathonId}`, { params }).then((r) => r.data),
  approveTeam: (id) => api.put(`/teams/${id}/approve`).then((r) => r.data),
  rejectTeam: (id, reason) => api.put(`/teams/${id}/reject`, { reason }).then((r) => r.data),
};

export default teamService;
