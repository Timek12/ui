import type {
  SecretCreateRequest,
  SecretResponse,
  SecretUpdate,
} from "../types/secret.types";
import { api } from "./api";

export const secretsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all user secrets
    getSecrets: builder.query<SecretResponse[], void>({
      query: () => "/api/secrets",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Secrets" as const, id })),
              { type: "Secrets", id: "LIST" },
            ]
          : [{ type: "Secrets", id: "LIST" }],
    }),

    // Get secret by ID
    getSecretById: builder.query<SecretResponse, string>({
      query: (id) => `/api/secrets/${id}`,
      providesTags: (result, error, id) => [{ type: "Secrets", id }],
    }),

    // Create new secret
    createSecret: builder.mutation<SecretResponse, SecretCreateRequest>({
      query: (secret) => ({
        url: "/api/secrets",
        method: "POST",
        body: secret,
      }),
      invalidatesTags: [{ type: "Secrets", id: "LIST" }],
    }),

    // Update secret
    updateSecret: builder.mutation<
      SecretResponse,
      { id: string; data: SecretUpdate }
    >({
      query: ({ id, data }) => ({
        url: `/api/secrets/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Secrets", id },
        { type: "Secrets", id: "LIST" },
      ],
    }),

    // Delete secret
    deleteSecret: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/secrets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Secrets", id },
        { type: "Secrets", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSecretsQuery,
  useGetSecretByIdQuery,
  useCreateSecretMutation,
  useUpdateSecretMutation,
  useDeleteSecretMutation,
} = secretsApi;
