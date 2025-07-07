import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "./UI/LoadingScreen";

interface ProtectedRouteProps {
  requiredRole?: "admin" | "super_admin" | "user";
  redirectTo?: string;
  children?: React.ReactNode;
}

export default function ProtectedRoute({
  requiredRole,
  redirectTo = "/login",
  children,
}: ProtectedRouteProps) {
  const { user, authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;

  if (!user) return <Navigate to={redirectTo} replace />;

  if (requiredRole) {
    const allowed =
      requiredRole === "user" ||
      (requiredRole === "admin" && ["admin", "super_admin"].includes(user.role)) ||
      (requiredRole === "super_admin" && user.role === "super_admin");

    if (!allowed) {
      return <Navigate to="/unauthorised" replace />;
    }
  }

  return <>{children ?? <Outlet />}</>;
}
