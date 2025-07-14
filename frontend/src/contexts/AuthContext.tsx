// frontend/src/contexts/AuthContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import api, { setAccessToken } from "../utils/axiosInstance";
import { isTokenValid } from "../utils/TokenUtils";

// Types
interface Organisation {
  id: number;
  name: string;
  short_name?: string;
}

interface User {
  id: number;
  email: string;
  role: "super_admin" | "admin" | "user";
  first_name?: string;
  last_name?: string;
  organisation?: Organisation;
}

type Role = "super_admin" | "admin" | "user";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void; // ✅ Added
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  role: Role;
  setRoleOverride: (role: Role | null) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleOverride, setRoleOverride] = useState<Role | null>(
    sessionStorage.getItem("roleOverride") as Role | null
  );

  const hasAttemptedLogin = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !isTokenValid(token) || hasAttemptedLogin.current) {
      setAccessToken(null);
      setAuthLoading(false);
      return;
    }

    hasAttemptedLogin.current = true;
    setAccessToken(token);
    fetchUser();
  }, []);

  useEffect(() => {
    if (roleOverride) {
      sessionStorage.setItem("roleOverride", roleOverride);
    } else {
      sessionStorage.removeItem("roleOverride");
    }
  }, [roleOverride]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/me");
      setUser(res.data);
    } catch (err) {
      console.warn("Failed to fetch user:", err);
      setUser(null);
      setAccessToken(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/login", { email, password });
    const token = res.data.access_token;

    setAccessToken(token);
    setRoleOverride(null);
    hasAttemptedLogin.current = false;
    await fetchUser();
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      setAccessToken(null);
      sessionStorage.removeItem("roleOverride");
      setUser(null);
      setRoleOverride(null);
      hasAttemptedLogin.current = false;
    }
  };

  const refetchUser = async () => {
    try {
      const res = await api.get("/me");
      setUser(res.data);
    } catch (err) {
      console.warn("User refetch failed:", err);
      setUser(null);
    }
  };

  const effectiveRole: Role = roleOverride || user?.role || "user";
  const isSuperAdmin = effectiveRole === "super_admin";
  const isAdmin = ["admin", "super_admin"].includes(effectiveRole);
  const isUser = effectiveRole === "user";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // ✅ Added here
        authLoading,
        login,
        logout,
        refetchUser,
        role: effectiveRole,
        setRoleOverride,
        isSuperAdmin,
        isAdmin,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
