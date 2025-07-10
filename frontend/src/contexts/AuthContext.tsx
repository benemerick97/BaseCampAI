// frontend/src/contexts/AuthContext.tsx

import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../utils/axiosInstance"; // ✅ central API instance

const BACKEND_URL = import.meta.env.VITE_API_URL;

// Interfaces
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
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
  role: "super_admin" | "admin" | "user";
  setRoleOverride: (role: "super_admin" | "admin" | "user" | null) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isUser: boolean;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [authLoading, setAuthLoading] = useState(true);
  const [roleOverride, setRoleOverride] = useState<"super_admin" | "admin" | "user" | null>(
    sessionStorage.getItem("roleOverride") as "super_admin" | "admin" | "user" | null
  );

  // ⬇️ Inject token into axios instance
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    const validateTokenAndFetchUser = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else if (response.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            const retry = await fetch(`${BACKEND_URL}/me`, {
              headers: { Authorization: `Bearer ${newToken}` },
              credentials: "include",
            });
            if (retry.ok) {
              const userData = await retry.json();
              setUser(userData);
              setToken(newToken);
              localStorage.setItem("token", newToken);
            } else {
              logout();
            }
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        logout();
      } finally {
        setAuthLoading(false);
      }
    };

    validateTokenAndFetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (roleOverride) {
      sessionStorage.setItem("roleOverride", roleOverride);
    } else {
      sessionStorage.removeItem("roleOverride");
    }
  }, [roleOverride]);

  const refreshToken = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Refresh failed");

      const data = await response.json();
      return data.access_token;
    } catch (err) {
      console.error("Refresh token error:", err);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        setRoleOverride(null);
        await refetchUser();
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      localStorage.removeItem("token");
      sessionStorage.removeItem("roleOverride");
      setUser(null);
      setToken(null);
      setRoleOverride(null);
    }
  };

  const refetchUser = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error("User refetch failed:", error);
      logout();
    }
  };

  const effectiveRole: "super_admin" | "admin" | "user" =
    roleOverride || user?.role || "user";

  const isSuperAdmin = effectiveRole === "super_admin";
  const isAdmin = ["admin", "super_admin"].includes(effectiveRole);
  const isUser = effectiveRole === "user";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        login,
        logout,
        refetchUser,
        role: effectiveRole,
        setRoleOverride,
        isSuperAdmin,
        isAdmin,
        isUser,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
