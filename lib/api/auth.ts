const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface User {
  name: string;
  email: string;
  provider: string;
  userID: string;
  avatarURL: string;
  nickName: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
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

// Authentication API functions
export const authApi = {
  // Initiate OAuth login - this will redirect to OAuth provider
  initiateLogin: (provider: string = 'google') => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  },

  // Check current authentication status
  checkAuth: async (): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        credentials: 'include', // Important for session cookies
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        // User is not authenticated
        return { success: false };
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        return { success: true, user: data.user };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Logout
  logout: async (provider: string = 'google'): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout/${provider}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: 'Network error' };
    }
  },
};

// Cryptographic API functions
export const cryptoApi = {
  // Encrypt data
  encrypt: async (request: EncryptRequest): Promise<EncryptResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/encrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { data: '', error: data.error || 'Encryption failed' };
      }

      return data;
    } catch (error) {
      console.error('Encryption failed:', error);
      return { data: '', error: 'Network error' };
    }
  },

  // Decrypt data
  decrypt: async (request: DecryptRequest): Promise<DecryptResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/decrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { data: '', error: data.error || 'Decryption failed' };
      }

      return data;
    } catch (error) {
      console.error('Decryption failed:', error);
      return { data: '', error: 'Network error' };
    }
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
};
