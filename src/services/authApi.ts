import type {
  LoginCredentials,
  LoginResponse,
  LogoutAllResponse,
  MessageResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SessionsResponse,
  UserCreate,
  UserPublic,
} from "../types/auth.types";
import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Register new user
    register: builder.mutation<LoginResponse, UserCreate>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    // Login with email and password
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: {
          email: credentials.email,
          password: credentials.password,
        },
      }),
      invalidatesTags: ["User"],
    }),

    // Refresh access token
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (request) => ({
        url: "/auth/refresh",
        method: "POST",
        body: request,
      }),
    }),

    // Get current user info
    getCurrentUser: builder.query<UserPublic, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    // Logout (revoke token)
    logout: builder.mutation<MessageResponse, { token: string }>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Sessions"],
    }),

    // Logout from all devices
    logoutAll: builder.mutation<LogoutAllResponse, void>({
      query: () => ({
        url: "/auth/logout-all",
        method: "POST",
      }),
      invalidatesTags: ["User", "Sessions"],
    }),

    // Get active sessions
    getSessions: builder.query<SessionsResponse, void>({
      query: () => "/auth/sessions",
      providesTags: ["Sessions"],
    }),

    // Revoke specific session
    revokeSession: builder.mutation<MessageResponse, string>({
      query: (jti) => ({
        url: `/auth/sessions/${jti}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sessions"],
    }),

    // Verify token
    verifyToken: builder.query<
      { valid: boolean; user_id: string; email: string; expires_at: number },
      void
    >({
      query: () => "/auth/verify",
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useLogoutAllMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useVerifyTokenQuery,
} = authApi;
