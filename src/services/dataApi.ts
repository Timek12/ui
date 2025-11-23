import type {
  DataCreateRequest,
  DataResponse,
  DataUpdate,
} from "../types/data.types";
import { api } from "./api";

export const dataApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all user data
    getData: builder.query<DataResponse[], void>({
      query: () => "/api/data",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Data" as const, id })),
              { type: "Data", id: "LIST" },
            ]
          : [{ type: "Data", id: "LIST" }],
    }),

    // Get data by ID
    getDataById: builder.query<DataResponse, string>({
      query: (id) => `/api/data/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Data", id }],
    }),

    // Create new data
    createData: builder.mutation<DataResponse, DataCreateRequest>({
      query: (data) => ({
        url: "/api/data",
        method: "POST",
        body: data,
      }),
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
  }),
});

export const {
  useGetDataQuery,
  useGetDataByIdQuery,
  useCreateDataMutation,
  useUpdateDataMutation,
  useDeleteDataMutation,
} = dataApi;
