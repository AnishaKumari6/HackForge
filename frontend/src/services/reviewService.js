import api from "./api";

const reviewService = {
  submitReview: (submissionId, payload) => api.post(`/reviews/submission/${submissionId}`, payload).then((r) => r.data),
  getMyReviewForSubmission: (submissionId) => api.get(`/reviews/submission/${submissionId}/mine`).then((r) => r.data),
  getAssignedProjects: (hackathonId) => api.get(`/reviews/assigned/${hackathonId}`).then((r) => r.data),
  getHistory: () => api.get("/reviews/history").then((r) => r.data),
  getReviewsForSubmission: (submissionId) => api.get(`/reviews/submission/${submissionId}`).then((r) => r.data),
  getLeaderboard: (hackathonId) => api.get(`/reviews/leaderboard/${hackathonId}`).then((r) => r.data),
};

export default reviewService;
