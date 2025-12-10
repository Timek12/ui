import type {
    LoginCredentials,
    LoginResponse,
    MessageResponse,
    RefreshTokenRequest,
    TokenPair,
    UserCreate,
    UserPublic
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

    // Refresh access token (used internally by baseQueryWithReauth)
    refreshToken: builder.mutation<TokenPair, RefreshTokenRequest>({
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
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
} = authApi;
