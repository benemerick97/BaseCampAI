// App.tsx
import LoadingScreen from "./components/UI/LoadingScreen";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorised from "./pages/Unauthorised"; // 👈 Create this simple page

function App() {
  const { user, authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard/chat" : "/login"} />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard/chat" replace /> : <Login />} />
      <Route path="/unauthorised" element={<Unauthorised />} />

      {/* General authenticated user access */}
      <Route element={<ProtectedRoute requiredRole="user" />}>
        <Route path="/dashboard/:page" element={<Dashboard />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/chat" />} />
      </Route>

      {/* Example: Admin-only route */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<div>Admin panel here</div>} />
      </Route>
    </Routes>
  );
}

export default App;
