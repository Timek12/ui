import { api } from "./api";

// Admin User Management Types
export interface UserManagementItem {
  user_id: number;
  email: string;
  name: string | null;
  role: "user" | "admin";
  auth_method: string;
  provider: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserRoleRequest {
  role: "user" | "admin";
}

// Admin Secret Management Types
export interface AdminSecretItem {
  id: string;
  user_id: number;
  name: string;
  description: string;
  version: number;
  created_at: string;
  updated_at: string;
}

// Admin API endpoints
const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // User Management
    getAllUsers: builder.query<UserManagementItem[], void>({
      query: () => ({
        url: "/auth/admin/users",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    getUserById: builder.query<UserManagementItem, number>({
      query: (userId) => ({
        url: `/auth/admin/users/${userId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, userId) => [
        { type: "Users", id: userId },
      ],
    }),

    updateUserRole: builder.mutation<
      UserManagementItem,
      { userId: number; role: UpdateUserRoleRequest }
    >({
      query: ({ userId, role }) => ({
        url: `/auth/admin/users/${userId}`,
        method: "PUT",
        body: role,
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/auth/admin/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    // Secret Management
    getAllSecrets: builder.query<AdminSecretItem[], void>({
      query: () => ({
        url: "/api/admin/secrets",
        method: "GET",
      }),
      providesTags: ["AdminSecrets"],
    }),

    getUserSecrets: builder.query<AdminSecretItem[], number>({
      query: (userId) => ({
        url: `/api/admin/secrets/user/${userId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, userId) => [
        { type: "AdminSecrets", id: userId },
      ],
    }),

    deleteAnySecret: builder.mutation<void, string>({
      query: (secretId) => ({
        url: `/api/admin/secrets/${secretId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminSecrets", "Secrets"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetAllSecretsQuery,
  useGetUserSecretsQuery,
  useDeleteAnySecretMutation,
} = adminApi;
