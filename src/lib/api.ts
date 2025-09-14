const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface User {
  id: number;
  email: string;
  name: string;
  provider: string;
  avatar_url?: string;
}

export interface AuthResponse {
  user?: User;
  success?: boolean;
  error?: string;
  message?: string;
}

// Simple API request wrapper
const api = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: "include", // Include HTTP-only cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authApi = {
  // Check current auth status
  checkAuth: async (): Promise<AuthResponse> => {
    try {
      const data = await api(`${API_BASE_URL}/user`);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: "not_authenticated" };
    }
  },

  // Login with email/password
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const data = await api(`${API_BASE_URL}/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        error: "login_failed",
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  },

  // Register new user
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const data = await api(`${API_BASE_URL}/register`, {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        error: "register_failed",
        message: error instanceof Error ? error.message : "Registration failed",
      };
    }
  },

  // OAuth login
  oauthLogin: (provider: string) => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api(`${API_BASE_URL}/logout`, { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
};
