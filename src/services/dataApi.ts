import type {
    DataCreateRequest,
    DataListItem,
    DataResponse,
    DataUpdate,
} from "../types/data.types";
import { api } from "./api";

export const dataApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all user data
    getData: builder.query<DataListItem[], { type?: string; projectId?: string } | void>({
      query: (arg) => {
        const params: Record<string, string> = {};
        if (arg?.type) params.data_type = arg.type;
        
        if (arg?.projectId) {
            return {
                url: `/api/data/project/${arg.projectId}`,
                params
            };
        }
        return {
            url: "/api/data",
            params
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Data" as const, id })),
              { type: "Data", id: "LIST" },
            ]
          : [{ type: "Data", id: "LIST" }],
    }),

    // Get data by ID
    getDataById: builder.query<DataResponse, { id: string; projectId?: string }>({
      query: ({ id, projectId }) => {
          if (projectId) {
              return `/api/data/project/${projectId}/${id}`;
          }
          return `/api/data/${id}`;
      },
      providesTags: (_result, _error, { id }) => [{ type: "Data", id }],
    }),

    // Create new data
    createData: builder.mutation<DataResponse, DataCreateRequest & { projectId?: string }>({
      query: ({ projectId, ...data }) => {
        const params: Record<string, string> = {};
        if (projectId) params.project_id = projectId;
        return {
            url: "/api/data",
            method: "POST",
            body: data,
            params
        };
      },
      invalidatesTags: [{ type: "Data", id: "LIST" }],
    }),

    // Update data
    updateData: builder.mutation<
      DataResponse,
      { id: string; data: DataUpdate }
    >({
      query: ({ id, data }) => ({
        url: `/api/data/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Data", id },
        { type: "Data", id: "LIST" },
      ],
    }),

    // Delete data
    deleteData: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/data/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Data", id },
        { type: "Data", id: "LIST" },
      ],
    }),

    // Rotate Data
    rotateData: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/api/data/${id}/rotate`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Data", id },
        { type: "Data", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDataQuery,
  useGetDataByIdQuery,
  useCreateDataMutation,
  useUpdateDataMutation,
  useDeleteDataMutation,
  useRotateDataMutation,
} = dataApi;
