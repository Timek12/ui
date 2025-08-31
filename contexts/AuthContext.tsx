"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi } from "@/lib/api/auth";

interface User {
  id: number;
  email: string;
  name: string;
  provider: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  oauthLogin: (provider: string) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  } | void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const result = await authApi.checkAuth();

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setUser(null);
        setIsAuthenticated(false);

        // Return more specific error information
        if (result.error) {
          return {
            success: false,
            error: result.error,
            message: result.message || "Authentication failed",
          };
        }

        return {
          success: false,
          error: "auth_failed",
          message: "Authentication failed",
        };
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      return {
        success: false,
        error: "network_error",
        message: "Network error occurred",
      };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      const result = await authApi.login(credentials);

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "login_failed",
          message: result.message || "Login failed. Please try again.",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "network_error",
        message: "Network error. Please check your connection.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      const result = await authApi.register(userData);

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "registration_failed",
          message: result.message || "Registration failed. Please try again.",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "network_error",
        message: "Network error. Please check your connection.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const oauthLogin = (provider: string) => {
    authApi.initiateOAuthLogin(provider);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    oauthLogin,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
