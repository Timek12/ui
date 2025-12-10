// Vault Types
export interface VaultStatus {
  sealed: boolean;
  initialized: boolean;
  version: string;
  uptime?: number;
  last_seal_time?: string;
  last_unseal_time?: string;
}

export interface StatusResponse {
  status: "success" | "error" | "warning" | "info";
  vault: VaultStatus;
  message?: string;
  timestamp: string;
}

export interface InitRequest {
  external_token: string;
  root_key_name?: string;
}

export interface UnsealRequest {
  external_token: string;
}
