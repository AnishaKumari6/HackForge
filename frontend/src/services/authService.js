import api from "./api";

const authService = {
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  refreshToken: () => api.post("/auth/refresh-token").then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`).then((r) => r.data),
  resendVerification: () => api.post("/auth/resend-verification").then((r) => r.data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }).then((r) => r.data),
  updatePassword: (payload) => api.put("/auth/update-password", payload).then((r) => r.data),
};

export default authService;
