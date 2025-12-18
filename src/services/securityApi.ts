import { api } from "./api";

export interface LeakCheckResponse {
  is_leaked: boolean;
  count: number;
}

export interface PasswordCheckRequest {
  password: string;
}

export const securityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    checkLeak: builder.mutation<LeakCheckResponse, PasswordCheckRequest>({
      query: (data) => ({
        url: "/api/security/check-leak",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useCheckLeakMutation } = securityApi;
