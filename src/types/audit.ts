export interface AuditLog {
  id: string;
  action: string;
  status: string;
  user_id?: string;
  resource_id?: string;
  resource_type?: string;
  ip_address?: string;
  user_agent?: string;
  details?: string;
  created_at: string;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  count: number;
}

export interface AuditLogFilters {
  user_id?: string;
  action?: string;
  resource_type?: string;
  limit?: number;
  offset?: number;
}
