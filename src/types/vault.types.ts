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

export interface EncryptRequest {
  plaintext: string;
  context?: Record<string, string>;
}

export interface EncryptionResult {
  ciphertext_b64: string;
  dek_id: number;
  algorithm: string;
  nonce_b64?: string;
  created_at: string;
}

export interface EncryptResponse {
  status: "success" | "error";
  data: EncryptionResult;
  message?: string;
  timestamp: string;
}

export interface DecryptRequest {
  dek_id: number;
  ciphertext_b64: string;
  context?: Record<string, string>;
}

export interface DecryptionResult {
  plaintext: string;
  dek_id: number;
  algorithm: string;
  decrypted_at: string;
}

export interface DecryptResponse {
  status: "success" | "error";
  data: DecryptionResult;
  message?: string;
  timestamp: string;
}

export interface DEKInfo {
  dek_id: number;
  key_type: "dek";
  version: number;
  created_at: string;
  purpose?: string;
}

export interface IssueDEKResponse {
  status: "success" | "error";
  data: DEKInfo;
  dek_ciphertext_b64: string;
  message?: string;
  timestamp: string;
}
