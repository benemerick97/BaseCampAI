// App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoadingScreen from "./components/UI/LoadingScreen";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorised from "./pages/Unauthorised";

export default function App() {
  const { user, authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Entry redirect */}
      <Route path="/" element={<Navigate to={user ? "/dashboard/chat" : "/login"} />} />

      {/* Login screen */}
      <Route path="/login" element={user ? <Navigate to="/dashboard/chat" replace /> : <Login />} />

      {/* Public route */}
      <Route path="/unauthorised" element={<Unauthorised />} />

      {/* Authenticated access */}
      <Route element={<ProtectedRoute requiredRole="user" />}>
        <Route path="/dashboard" element={<Navigate to="/dashboard/chat" />} />
        <Route path="/dashboard/:page" element={<Dashboard />} />
      </Route>

      {/* Admin-only route */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<div>Admin panel here</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
