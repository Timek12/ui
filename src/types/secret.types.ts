// Secret Types
export interface SecretResponse {
  id: string;
  user_id: string;
  name: string;
  description: string;
  key_id: string;
  encrypted_value: string;
  version: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  access_count: number;
  last_accessed_at: string | null;
}

export interface SecretCreateRequest {
  name: string;
  value: string;
  description?: string;
}

export interface SecretUpdate {
  name?: string;
  description?: string;
  key_id?: string;
  encrypted_value?: string;
  version?: number;
  tags?: string[];
}

export interface SecretListItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  version: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
