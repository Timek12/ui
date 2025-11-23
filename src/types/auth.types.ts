// User Types
export interface UserPublic {
  user_id: number;
  email: string;
  name: string | null;
  avatar_url: string | null;
  provider: string;
  role: "user" | "admin";
}

export interface UserResponse extends UserPublic {
  auth_method: string;
  provider_user_id: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  name?: string;
  password: string;
  avatar_url?: string;
  provider?: string;
  auth_method?: string;
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

export interface RefreshTokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

// Response Types
export interface MessageResponse {
  message: string;
}

export interface LogoutAllResponse {
  message: string;
  revoked_tokens: number;
}

export interface TokenVerificationResponse {
  valid: boolean;
  user_id?: string;
  email?: string;
  expires_at?: number;
}

export interface Session {
  jti: string;
  user_id: number;
  device?: string;
  ip_address?: string;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export type SessionsResponse = Session[];
