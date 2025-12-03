import type {
    DecryptRequest,
    DecryptResponse,
    EncryptRequest,
    EncryptResponse,
    InitRequest,

    StatusResponse,
    UnsealRequest,
} from "../types/vault.types";
import { api } from "./api";

export const vaultApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Initialize vault (admin only)
    initVault: builder.mutation<StatusResponse, InitRequest>({
      query: (request) => ({
        url: "/api/crypto/init",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["Vault"],
    }),

    // Unseal vault (admin only)
    unsealVault: builder.mutation<StatusResponse, UnsealRequest>({
      query: (request) => ({
        url: "/api/crypto/unseal",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["Vault", "Data"],
    }),

    // Seal vault (admin only)
    sealVault: builder.mutation<StatusResponse, void>({
      query: () => ({
        url: "/api/crypto/seal",
        method: "POST",
      }),
      invalidatesTags: ["Vault", "Data"],
    }),

    // Get vault status
    getVaultStatus: builder.query<StatusResponse, void>({
      query: () => "/api/crypto/status",
      providesTags: ["Vault"],
    }),


    // Encrypt data
    encryptData: builder.mutation<EncryptResponse, EncryptRequest>({
      query: (request) => ({
        url: "/api/crypto/encrypt",
        method: "POST",
        body: request,
      }),
    }),

    // Decrypt data
    decryptData: builder.mutation<DecryptResponse, DecryptRequest>({
      query: (request) => ({
        url: "/api/crypto/decrypt",
        method: "POST",
        body: request,
      }),
    }),
  }),
});

export const {
  useInitVaultMutation,
  useUnsealVaultMutation,
  useSealVaultMutation,
  useGetVaultStatusQuery,

  useEncryptDataMutation,
  useDecryptDataMutation,
} = vaultApi;
