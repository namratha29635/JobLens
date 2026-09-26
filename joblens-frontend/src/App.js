import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Auth & Landing Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import { ChangePassword, ForgotPassword } from "./pages/auth/ChangePassword";

// Layout
import Layout from "./components/ui/Layout";
import { LoadingPage } from "./components/ui";

// Coordinator Pages
import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import CoordinatorJobPostings from "./pages/coordinator/JobPostings";
import CoordinatorVerifyJobs from "./pages/coordinator/VerifyJobs";
import CoordinatorApplications from "./pages/coordinator/Applications";
import CoordinatorDrives from "./pages/coordinator/Drives";
import CoordinatorStudents from "./pages/coordinator/Students";
import CoordinatorCompanies from "./pages/coordinator/Companies";
import CoordinatorReports from "./pages/coordinator/Reports";
import CoordinatorSettings from "./pages/coordinator/Settings";
import RoundsPage from "./pages/coordinator/Rounds";
import { NotifyPage, AuditLogsPage } from "./pages/coordinator/Notify";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentBrowseJobs from "./pages/student/BrowseJobs";
import StudentApplications from "./pages/student/Applications";
import StudentSavedJobs from "./pages/student/SavedJobs";
import StudentProfile from "./pages/student/Profile";
import StudentNotifications from "./pages/student/Notifications";
import StudentSettings from "./pages/student/Settings";
import OffCampusDrives from "./pages/student/OffCampus";
import FeedbackPage from "./pages/student/Feedback";
import AITools from "./pages/student/AITools";
import JobVerifier from "./pages/student/JobVerifier";

import "./index.css";

// Protected Route
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage text="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.isFirstLogin) return <Navigate to="/change-password" replace />;
  if (role && user.role !== role)
    return (
      <Navigate
        to={
          user.role === "coordinator"
            ? "/coordinator/dashboard"
            : "/student/dashboard"
        }
        replace
      />
    );
  return children;
}

// With Layout
function WithLayout({ children }) {
  return <Layout>{children}</Layout>;
}

// App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing & Auth */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* COORDINATOR ROUTES */}
      <Route
        path="/coordinator"
        element={<Navigate to="/coordinator/dashboard" replace />}
      />
      <Route
        path="/coordinator/dashboard"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <CoordinatorDashboard />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/postings"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <CoordinatorJobPostings />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/verify"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <CoordinatorVerifyJobs />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/applications"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <CoordinatorApplications />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/drives"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <CoordinatorDrives />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/drives/new"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <CoordinatorJobPostings />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/new-drive"
        element={<Navigate to="/coordinator/postings" replace />}
      />
      <Route
        path="/coordinator/students"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <CoordinatorStudents />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/companies"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <CoordinatorCompanies />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/reports"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <CoordinatorReports />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/rounds"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <RoundsPage />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/notify"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <NotifyPage />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/notifications"
        element={<Navigate to="/coordinator/notify" replace />}
      />
      <Route
        path="/coordinator/settings"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <CoordinatorSettings />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/audit"
        element={
          <ProtectedRoute role="coordinator">
            <WithLayout>
              <AuditLogsPage />
            </WithLayout>
          </ProtectedRoute>
        }
      />

      {/* STUDENT ROUTES */}
      <Route
        path="/student"
        element={<Navigate to="/student/dashboard" replace />}
      />
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute role="student">
            <WithLayout>
              <StudentDashboard />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/browse"
        element={
          <ProtectedRoute role="student">
            <WithLayout>
              <StudentBrowseJobs />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/applications"
        element={
          <ProtectedRoute role="student">
            <WithLayout>
              <StudentApplications />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/saved"
        element={
          <ProtectedRoute role="student">
            <WithLayout>
              <StudentSavedJobs />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/verifier"
        element={
          <ProtectedRoute role="student">
            <WithLayout>
              <JobVerifier />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/job-verifier"
        element={<Navigate to="/student/verifier" replace />}
      />
      <Route
        path="/student/fake-detect"
        element={<Navigate to="/student/verifier" replace />}
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute role="student">
            <WithLayout>
              <StudentProfile />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notifications"
        element={
          <ProtectedRoute role="student">
            <WithLayout>
              <StudentNotifications />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute role="student">
            <WithLayout>
              <StudentSettings />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/drives"
        element={<Navigate to="/student/browse" replace />}
      />
      <Route
        path="/student/offcampus"
        element={
          <ProtectedRoute role="student">
            <WithLayout>
              <OffCampusDrives />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/feedback"
        element={
          <ProtectedRoute role="student">
            <WithLayout>
              <FeedbackPage />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/ai"
        element={
          <ProtectedRoute role="student">
            <WithLayout>
              <AITools />
            </WithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/resume-match"
        element={<Navigate to="/student/ai?tab=resume" replace />}
      />
      <Route
        path="/student/job-links"
        element={<Navigate to="/student/ai?tab=joblinks" replace />}
      />
      <Route
        path="/student/chatbot"
        element={<Navigate to="/student/ai?tab=chatbot" replace />}
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "#ffffff",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
                borderRadius: "10px",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
