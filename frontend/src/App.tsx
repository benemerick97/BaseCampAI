// App.tsx
import LoadingScreen from "./components/UI/LoadingScreen";
import { useAuth } from "./contexts/AuthContext";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function App() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard/chat" : "/login"} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard/:page" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/dashboard" element={<Navigate to="/dashboard/chat" />} />
    </Routes>
  );
}

export default App;
