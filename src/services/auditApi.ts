import { AuditLogFilters, AuditLogListResponse } from "../types/audit";
import { api } from "./api";

export const auditApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLogs: builder.query<AuditLogListResponse, AuditLogFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          if (filters.user_id) params.append("user_id", filters.user_id);
          if (filters.action) params.append("action", filters.action);
          if (filters.resource_type) params.append("resource_type", filters.resource_type);
          if (filters.limit) params.append("limit", filters.limit.toString());
          if (filters.offset) params.append("offset", filters.offset.toString());
        }
        return `/api/audit?${params.toString()}`;
      },
      providesTags: ["Audit" as any],
    }),
  }),
});

export const { useGetLogsQuery } = auditApi;
