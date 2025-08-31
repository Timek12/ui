const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface EncryptRequest {
  data: string;
  keyPhrase: string;
}

export interface EncryptResponse {
  data: string;
  error?: string;
}

export interface DecryptRequest {
  data: string;
  keyPhrase: string;
}

export interface DecryptResponse {
  data: string;
  error?: string;
}

// API request wrapper with cookies
const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  return fetch(url, {
    ...options,
    credentials: "include", // Important: sends HttpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

// Authentication API functions
export const authApi = {
  // Local authentication - Login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/login`, {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, user: data.user || data };
      }

      // Handle specific error cases
      let errorMessage = data.message;
      let errorCode = data.error || "login_failed";

      // Check for invalid credentials
      if (
        response.status === 401 ||
        (data.message &&
          (data.message.includes("invalid") ||
            data.message.includes("credentials"))) ||
        (data.error && data.error.includes("invalid_credentials"))
      ) {
        errorCode = "invalid_credentials";
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      }

      return { error: errorCode, message: errorMessage };
    } catch (error) {
      console.error("Login failed:", error);
      return { error: "network_error", message: "Network error occurred" };
    }
  },

  // Local authentication - Register
  register: async (credentials: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/register`, {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, user: data.user || data };
      }

      // Handle specific error cases
      let errorMessage = data.message;
      let errorCode = data.error || "registration_failed";

      // Check for email already exists error
      if (
        response.status === 409 ||
        (data.message && data.message.includes("email")) ||
        (data.error && data.error.includes("duplicate")) ||
        (data.message && data.message.includes("already exists")) ||
        (data.message && data.message.includes("unique constraint"))
      ) {
        errorCode = "email_exists";
        errorMessage =
          "An account with this email address already exists. Please use a different email or try logging in.";
      }

      return {
        error: errorCode,
        message: errorMessage,
      };
    } catch (error) {
      console.error("Registration failed:", error);
      return { error: "network_error", message: "Network error occurred" };
    }
  },

  // OAuth login - Google
  initiateOAuthLogin: (provider: string = "google") => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  },

  // Check current authentication status
  checkAuth: async (): Promise<AuthResponse> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/user`);

      if (response.ok) {
        const data = await response.json();
        return { success: true, user: data };
      }

      // If we get here, the user is not authenticated
      return { error: "not_authenticated" };
    } catch (error) {
      console.error("Auth check failed:", error);
      return { error: "network_error", message: "Network error occurred" };
    }
  },

  // Check OAuth status after callback
  checkOAuthStatus: async (): Promise<AuthResponse> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/user`);

      if (response.ok) {
        const data = await response.json();
        return { success: true, user: data };
      }

      // Check for specific OAuth errors
      if (response.status === 409) {
        return {
          error: "email_exists",
          message:
            "This email is already registered with a local account. Please sign in with your email and password instead, or use a different Google account.",
        };
      }

      return { error: "oauth_failed", message: "OAuth authentication failed" };
    } catch (error) {
      console.error("OAuth status check failed:", error);
      return { error: "network_error", message: "Network error occurred" };
    }
  },

  // Logout
  logout: async (): Promise<AuthResponse> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/logout`, {
        method: "POST",
      });

      if (response.ok) {
        return { success: true };
      }

      const data = await response.json();
      return { error: data.error || "logout_failed", message: data.message };
    } catch (error) {
      console.error("Logout failed:", error);
      return { error: "network_error", message: "Network error occurred" };
    }
  },
};

// Cryptographic API functions
export const cryptoApi = {
  // Encrypt data
  encrypt: async (request: EncryptRequest): Promise<EncryptResponse> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/encrypt`, {
        method: "POST",
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: "", error: data.error || "Encryption failed" };
      }

      return data;
    } catch (error) {
      console.error("Encryption failed:", error);
      return { data: "", error: "Network error" };
    }
  },

  // Decrypt data
  decrypt: async (request: DecryptRequest): Promise<DecryptResponse> => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/decrypt`, {
        method: "POST",
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: "", error: data.error || "Decryption failed" };
      }

      return data;
    } catch (error) {
      console.error("Decryption failed:", error);
      return { data: "", error: "Network error" };
    }
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Health check failed:", error);
    return { status: "error" };
  }
};
