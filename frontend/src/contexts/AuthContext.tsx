// src/contexts/AuthContext.tsx

import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";

// Add Organisation interface
interface Organisation {
  id: number;
  name: string;
}

// Updated User interface with organisation
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
  setUser: (user: User | null) => void;
  login: (email: string, password: string, onSuccess?: () => void) => Promise<void>;
  logout: () => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isUser: boolean;
  refetchUser: () => Promise<void>; // ✅ Add this
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, onSuccess?: () => void) => {
    const response = await fetch("https://basecampai.ngrok.io/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      if (onSuccess) onSuccess();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("https://basecampai.ngrok.io/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      } else {
        console.error("Failed to refetch user");
      }
    } catch (error) {
      console.error("Error during user refetch:", error);
    }
  };

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || isSuperAdmin;
  const isUser = user?.role === "user";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isSuperAdmin,
        isAdmin,
        isUser,
        refetchUser, // ✅ Provided here
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
