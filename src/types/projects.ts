export interface Project {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    created_by: number;
}

export interface ProjectMember {
    user_id: number;
    project_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
}

export interface CreateProjectRequest {
    name: string;
}

export interface AddMemberRequest {
    user_id: number;
    role: 'owner' | 'admin' | 'member';
}
