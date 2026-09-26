import axios from "axios";

export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    const cleaned = process.env.REACT_APP_API_URL.replace(/\/+$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
  }
  if (typeof window !== "undefined" && window.location) {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "/api";
    }
  }
  return "https://joblens-1-b9z5.onrender.com/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("joblens_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      !err.config?.url?.includes("/auth/login") &&
      !err.config?.url?.includes("/auth/register")
    ) {
      localStorage.removeItem("joblens_token");
      localStorage.removeItem("joblens_user");

      window.location.href = "/login";
    }

    return Promise.reject(err);
  },
);

// AUTH
export const authAPI = {
  login: (data) => api.post("/auth/login", data),

  register: (data) => api.post("/auth/register", data),

  seedDemo: () => api.post("/auth/seed-demo"),

  forgotPassword: (data) => api.post("/auth/forgot-password", data),

  resetPassword: (data) => api.post("/auth/reset-password", data),

  changePassword: (data) => api.patch("/auth/change-password", data),

  getMe: () => api.get("/auth/me"),
};

// COORDINATOR
export const coordinatorAPI = {
  getDashboard: () => api.get("/coordinator/dashboard"),

  getPlacementStats: (batch) =>
    api.get(`/coordinator/placement-stats/${batch}`),

  getStudents: (params) => api.get("/coordinator/students", { params }),

  getStudentDetail: (id) => api.get(`/coordinator/students/${id}`),

  getAllApplications: (params) => api.get("/coordinator/applications", { params }),

  updateApplicationStatus: (id, data) => api.patch(`/coordinator/applications/${id}/status`, data),

  bulkUpdateApplications: (data) => api.post("/coordinator/applications/bulk-status", data),

  sendNotification: (data) => api.post("/coordinator/notify", data),

  getNotificationHistory: () => api.get("/coordinator/notifications/history"),

  getAudienceCount: (params) => api.get("/coordinator/audience-count", { params }),

  getAuditLogs: (params) => api.get("/coordinator/audit-logs", { params }),
};

// ON-CAMPUS DRIVES
export const onCampusAPI = {
  create: (data) => api.post("/oncampus", data),

  getAll: (params) => api.get("/oncampus", { params }),

  getById: (id) => api.get(`/oncampus/${id}`),

  update: (id, data) => api.patch(`/oncampus/${id}`, data),

  getEligible: (id) => api.get(`/oncampus/${id}/eligible-students`),

  getApplications: (id, p) =>
    api.get(`/oncampus/${id}/applications`, {
      params: p,
    }),
};

// OFF-CAMPUS DRIVES
export const offCampusAPI = {
  create: (data) => api.post("/offcampus", data),

  getAll: (params) => api.get("/offcampus", { params }),

  getById: (id) => api.get(`/offcampus/${id}`),

  update: (id, data) => api.patch(`/offcampus/${id}`, data),

  delete: (id) => api.delete(`/offcampus/${id}`),
};

// ROUNDS
export const roundsAPI = {
  create: (data) => api.post("/rounds", data),

  update: (id, data) => api.patch(`/rounds/${id}`, data),

  getByDrive: (driveId) => api.get(`/rounds/drive/${driveId}`),

  uploadEligible: (id, form) => api.patch(`/rounds/${id}/eligible-list`, form),

  uploadAttended: (id, form) => api.patch(`/rounds/${id}/attended-list`, form),

  uploadQualified: (id, form) =>
    api.patch(`/rounds/${id}/qualified-list`, form),
};

// STUDENT
export const studentAPI = {
  getProfile: () => api.get("/student/profile"),

  updateProfile: (data) => api.patch("/student/profile", data),

  uploadResume: (form) => api.post("/student/resume", form),

  getDashboard: () => api.get("/student/dashboard"),

  getOnCampusDrives: (params) => api.get("/student/drives/oncampus", { params }),

  applyToDrive: (id) => api.post(`/student/drives/oncampus/${id}/apply`),

  getAppStatus: (id) => api.get(`/student/drives/oncampus/${id}/status`),

  getOffCampusFeed: (params) =>
    api.get("/student/drives/offcampus", { params }),

  // AI JOB LINKS
  generateJobLinks: (data) => api.post("/student/job-links", data),

  // RESUME MATCH AI
  resumeMatch: (data) => api.post("/student/resume-match", data),

  // AI CHATBOT
  chatbotMessage: (data) => api.post("/student/chatbot", data),
  getChatHistory: () => api.get("/student/chatbot/history"),
  getChatById: (id) => api.get(`/student/chatbot/history/${id}`),
  deleteChatHistory: (id) => api.delete(`/student/chatbot/history/${id}`),
  // JOB VERIFIER
  checkJobAuthenticity: (data) => api.post("/student/job-verifier/check", data),

  getCompanyReviews: (params) => api.get("/student/job-verifier/company-reviews", { params }),

  // NOTIFICATIONS
  getNotifications: () => api.get("/student/notifications"),
  markNotificationRead: (id) => api.patch(`/student/notifications/${id}/read`),
  markAllNotificationsRead: () => api.patch("/student/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/student/notifications/${id}`),
};

// FEEDBACK
export const feedbackAPI = {
  submit: (data) => api.post("/feedback", data),

  getCompanies: () => api.get("/feedback/companies"),

  getByCompany: (name, p) =>
    api.get(`/feedback/company/${name}`, {
      params: p,
    }),

  getByDrive: (id) => api.get(`/feedback/drive/${id}`),
};

// RESUME URL & OPENER HELPER
export const getBackendBase = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "");
  }
  if (typeof window !== "undefined" && window.location) {
    const { hostname, port } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return port === "3000" ? "http://localhost:5000" : window.location.origin;
    }
  }
  return "https://joblens-1-b9z5.onrender.com";
};

export const getResumeUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const backendBase = getBackendBase();
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${backendBase}${cleanUrl}`;
};

export const openResume = (url) => {
  if (!url) return false;
  const fullUrl = getResumeUrl(url);
  window.open(fullUrl, "_blank", "noopener,noreferrer");
  return true;
};

export default api;
