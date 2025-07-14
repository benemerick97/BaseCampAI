import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "./UI/LoadingScreen";

interface ProtectedRouteProps {
  requiredRole?: "user" | "admin" | "super_admin";
  redirectTo?: string; // Optional override, defaults to /login
  children?: React.ReactNode;
}

export default function ProtectedRoute({
  requiredRole = "user",
  redirectTo = "/login",
  children,
}: ProtectedRouteProps) {
  const { user, authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;

  if (!user) return <Navigate to={redirectTo} replace />;

  const roleHierarchy = {
    user: 1,
    admin: 2,
    super_admin: 3,
  };

  const userRoleLevel = roleHierarchy[user.role];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  const isAuthorised = userRoleLevel >= requiredRoleLevel;

  if (!isAuthorised) {
    return <Navigate to="/unauthorised" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
