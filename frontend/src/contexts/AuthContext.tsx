import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";

// Organisation interface
interface Organisation {
  id: number;
  name: string;
  short_name?: string;
}

// User interface
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
  token: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, onSuccess?: () => void) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
  role: "super_admin" | "admin" | "user";
  setRoleOverride: (role: "super_admin" | "admin" | "user" | null) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [roleOverride, setRoleOverride] = useState<"super_admin" | "admin" | "user" | null>(null);

  // Load token and role override on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const storedOverride = sessionStorage.getItem("roleOverride");

    if (savedToken) {
      setToken(savedToken);
      refetchUser(); // ✅ Always fetch fresh user data
    }

    if (storedOverride === "super_admin" || storedOverride === "admin" || storedOverride === "user") {
      setRoleOverride(storedOverride);
    }
  }, []);

  useEffect(() => {
    if (roleOverride) {
      sessionStorage.setItem("roleOverride", roleOverride);
    } else {
      sessionStorage.removeItem("roleOverride");
    }
  }, [roleOverride]);

  const login = async (email: string, password: string, onSuccess?: () => void) => {
    const response = await fetch("https://basecampai.ngrok.io/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      setRoleOverride(null); // Reset override on login
      await refetchUser(); // ✅ Immediately load full user (including organisation.short_name)
      if (onSuccess) onSuccess();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("roleOverride");
    setUser(null);
    setToken(null);
    setRoleOverride(null);
  };

  const refetchUser = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return;

    try {
      const response = await fetch("https://basecampai.ngrok.io/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error("Failed to refetch user");
      }
    } catch (error) {
      console.error("Error during user refetch:", error);
    }
  };

  const effectiveRole: "super_admin" | "admin" | "user" = roleOverride || user?.role || "user";

  const isSuperAdmin = effectiveRole === "super_admin";
  const isAdmin = effectiveRole === "admin" || effectiveRole === "super_admin";
  const isUser = effectiveRole === "user";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
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
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
