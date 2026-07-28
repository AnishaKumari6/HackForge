import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Route guards
import { ProtectedRoute, RoleRoute, GuestOnlyRoute } from "./routes/RouteGuards";
import DashboardRedirect from "./routes/DashboardRedirect";

// Public pages
import HomePage from "./pages/public/HomePage";
import HackathonsPage from "./pages/public/HackathonsPage";
import HackathonDetailPage from "./pages/public/HackathonDetailPage";
import GalleryPage from "./pages/public/GalleryPage";
import AboutPage from "./pages/public/AboutPage";
import NotFoundPage from "./pages/public/NotFoundPage";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";

// Shared dashboard pages
import ProfilePage from "./pages/dashboard/ProfilePage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import BookmarksPage from "./pages/dashboard/BookmarksPage";

// Participant pages
import ParticipantOverview from "./pages/participant/ParticipantOverview";
import MyRegistrationsPage from "./pages/participant/MyRegistrationsPage";
import MyTeamsPage from "./pages/participant/MyTeamsPage";
import CreateTeamPage from "./pages/participant/CreateTeamPage";
import TeamDetailPage from "./pages/participant/TeamDetailPage";
import TeamInvitePage from "./pages/participant/TeamInvitePage";
import MySubmissionsPage from "./pages/participant/MySubmissionsPage";
import SubmissionEditorPage from "./pages/participant/SubmissionEditorPage";

// Organizer pages
import OrganizerOverview from "./pages/organizer/OrganizerOverview";
import MyHackathonsPage from "./pages/organizer/MyHackathonsPage";
import CreateHackathonPage from "./pages/organizer/CreateHackathonPage";
import ManageHackathonPage from "./pages/organizer/ManageHackathonPage";
import EditHackathonPage from "./pages/organizer/EditHackathonPage";

// Judge pages
import JudgeOverview from "./pages/judge/JudgeOverview";
import AssignedProjectsPage from "./pages/judge/AssignedProjectsPage";
import ScoringPage from "./pages/judge/ScoringPage";
import EvaluationHistoryPage from "./pages/judge/EvaluationHistoryPage";

// Admin pages
import AdminOverview from "./pages/admin/AdminOverview";
import ManageUsersPage from "./pages/admin/ManageUsersPage";
import ManageHackathonsAdminPage from "./pages/admin/ManageHackathonsAdminPage";
import ReportsPage from "./pages/admin/ReportsPage";
import ActivityLogsPage from "./pages/admin/ActivityLogsPage";

function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="hackathons" element={<HackathonsPage />} />
        <Route path="hackathons/:slug" element={<HackathonDetailPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="about" element={<AboutPage />} />

        {/* Guest-only auth pages */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="teams/invite/:token" element={<TeamInvitePage />} />
      </Route>

      {/* Authenticated dashboard */}
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardRedirect />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />

          {/* Participant */}
          <Route element={<RoleRoute roles={["participant"]} />}>
            <Route path="participant" element={<ParticipantOverview />} />
            <Route path="participant/registrations" element={<MyRegistrationsPage />} />
            <Route path="participant/teams" element={<MyTeamsPage />} />
            <Route path="participant/teams/create" element={<CreateTeamPage />} />
            <Route path="participant/teams/:id" element={<TeamDetailPage />} />
            <Route path="participant/submissions" element={<MySubmissionsPage />} />
            <Route path="participant/submissions/:hackathonId" element={<SubmissionEditorPage />} />
          </Route>

          {/* Organizer */}
          <Route element={<RoleRoute roles={["organizer", "admin"]} />}>
            <Route path="organizer" element={<OrganizerOverview />} />
            <Route path="organizer/hackathons" element={<MyHackathonsPage />} />
            <Route path="organizer/create" element={<CreateHackathonPage />} />
            <Route path="organizer/hackathons/:id" element={<ManageHackathonPage />} />
            <Route path="organizer/hackathons/:id/edit" element={<EditHackathonPage />} />
          </Route>

          {/* Judge */}
          <Route element={<RoleRoute roles={["judge"]} />}>
            <Route path="judge" element={<JudgeOverview />} />
            <Route path="judge/assigned" element={<AssignedProjectsPage />} />
            <Route path="judge/score/:submissionId" element={<ScoringPage />} />
            <Route path="judge/history" element={<EvaluationHistoryPage />} />
          </Route>

          {/* Admin */}
          <Route element={<RoleRoute roles={["admin"]} />}>
            <Route path="admin" element={<AdminOverview />} />
            <Route path="admin/users" element={<ManageUsersPage />} />
            <Route path="admin/hackathons" element={<ManageHackathonsAdminPage />} />
            <Route path="admin/reports" element={<ReportsPage />} />
            <Route path="admin/activity" element={<ActivityLogsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
