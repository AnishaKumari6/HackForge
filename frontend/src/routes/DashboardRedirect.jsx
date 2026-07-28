import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageSpinner } from "../components/ui/Primitives";

// Sends the logged-in user to their role's dashboard home.
const DashboardRedirect = () => {
  const { user, initializing } = useAuth();
  if (initializing) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  const map = {
    admin: "/dashboard/admin",
    organizer: "/dashboard/organizer",
    judge: "/dashboard/judge",
    participant: "/dashboard/participant",
  };

  return <Navigate to={map[user.role] || "/dashboard/participant"} replace />;
};

export default DashboardRedirect;
