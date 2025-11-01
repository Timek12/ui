import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { logout, setAccessToken } from "../store/authSlice";

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: "/",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Enhanced base query with automatic token refresh on 401
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error, try to refresh the token
  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (refreshToken) {
      // Try to refresh the access token
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refresh_token: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new access token
        const data = refreshResult.data as { access_token: string };
        api.dispatch(setAccessToken(data.access_token));

        // Retry the original request with the new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - log out the user
        api.dispatch(logout());
        window.location.href = "/login";
      }
    } else {
      // No refresh token available - log out
      api.dispatch(logout());
      window.location.href = "/login";
    }
  }

  return result;
};

// Base API configuration with auto-refresh
export const api = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Secrets", "Sessions", "Vault", "Users", "AdminSecrets"],
  endpoints: () => ({}),
});
