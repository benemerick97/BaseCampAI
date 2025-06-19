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
  token: string | null; // ✅ Added
  setUser: (user: User | null) => void;
  login: (email: string, password: string, onSuccess?: () => void) => Promise<void>;
  logout: () => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isUser: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // ✅ Added

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (savedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setToken(savedToken);
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
      setToken(data.access_token); // ✅ Set token
      if (onSuccess) onSuccess();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null); // ✅ Clear token
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
        token, // ✅ Provide it to context
        setUser,
        login,
        logout,
        isSuperAdmin,
        isAdmin,
        isUser,
        refetchUser,
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
