// User Types
export interface UserPublic {
  user_id: number;
  email: string;
  name: string | null;
  role: "user" | "admin";
}

export interface UserResponse extends UserPublic {
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  name?: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Token Types
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface LoginResponse {
  user: UserPublic;
  tokens: TokenPair;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}



// Response Types
export interface MessageResponse {
  message: string;
}



export interface TokenVerificationResponse {
  valid: boolean;
  user_id?: string;
  email?: string;
  expires_at?: number;
}


