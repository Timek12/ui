import { AddMemberRequest, CreateProjectRequest, Project, ProjectMember } from '../types/projects';
import { api } from "./api";

export const projectsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // List projects
    listProjects: builder.query<Project[], void>({
      query: () => "/api/projects",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Project" as const, id })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }],
    }),

    // Get project details
    getProject: builder.query<Project, string>({
      query: (id) => `/api/projects/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Project", id }],
    }),

    // Create project
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (data) => ({
        url: "/api/projects",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),

    // Get members
    getMembers: builder.query<ProjectMember[], string>({
      query: (projectId) => `/api/projects/${projectId}/members`,
      providesTags: (result, _error, projectId) => 
        result 
        ? [
            ...result.map(({ user_id }) => ({ type: "Project" as const, id: `MEMBER_${projectId}_${user_id}` })),
            { type: "Project", id: `MEMBERS_${projectId}` }
          ]
        : [{ type: "Project", id: `MEMBERS_${projectId}` }],
    }),

    // Add member
    addMember: builder.mutation<ProjectMember, { projectId: string; data: AddMemberRequest }>({
      query: ({ projectId, data }) => ({
        url: `/api/projects/${projectId}/members`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: "Project", id: `MEMBERS_${projectId}` }],
    }),

    // Remove member
    removeMember: builder.mutation<void, { projectId: string; userId: number }>({
      query: ({ projectId, userId }) => ({
        url: `/api/projects/${projectId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: "Project", id: `MEMBERS_${projectId}` }],
    }),

    // Delete project
    deleteProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/api/projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),

    // Update project
    updateProject: builder.mutation<Project, { projectId: string; name: string }>({
      query: ({ projectId, name }) => ({
        url: `/api/projects/${projectId}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Project", id: projectId },
        { type: "Project", id: "LIST" }
      ],
    }),
  }),
});

export const {
  useListProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useGetMembersQuery,
  useAddMemberMutation,
  useRemoveMemberMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} = projectsApi;
