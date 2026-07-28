import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageSpinner } from "../components/ui/Primitives";

export const ProtectedRoute = () => {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
};

export const RoleRoute = ({ roles }) => {
  const { user, initializing } = useAuth();

  if (initializing) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export const GuestOnlyRoute = () => {
  const { user, initializing } = useAuth();
  if (initializing) return <PageSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
