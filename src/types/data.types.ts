// Secret types (kept as DataType for API compatibility)
export type DataType =
  | "text_with_ttl"
  | "kubernetes"
  | "credentials"
  | "api_key"
  | "ssh_key"
  | "certificate";

// Request to create a new secret
export interface DataCreateRequest {
  name: string;
  description?: string;
  data_type: string;

  // Text with TTL
  fields?: Array<{ key: string; value: string }>;
  ttl?: number;

  // Kubernetes
  namespace?: string;
  data?: Array<{ key: string; value: string }>;

  // Credentials
  username?: string;
  password?: string;
  url?: string;

  // API Key
  apiKey?: string;
  headers?: Array<{ key: string; value: string }>;

  // SSH Key
  privateKey?: string;
  publicKey?: string;
  passphrase?: string;
  host?: string;

  // Certificate
  certificate?: string;
  chain?: string;
}

export interface DataMetadata {
  namespace?: string;
  username?: string;
  host?: string;
  url?: string;
  hasPublicKey?: boolean;
  hasChain?: boolean;
}

export interface DataResponse {
  id: string;
  user_id: number;
  name: string;
  description: string;
  data_type: DataType;
  version: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  ttl_seconds?: number;
  expires_at?: string;

  decrypted_data: {
    // Text with TTL
    fields?: Array<{ key: string; value: string }>;

    // Kubernetes
    namespace?: string;
    data?: Array<{ key: string; value: string }>;

    // Credentials
    password?: string;

    // API Key
    apiKey?: string;

    // SSH Key
    privateKey?: string;
    publicKey?: string;
    passphrase?: string;

    // Certificate
    certificate?: string;
    chain?: string;
  };

  metadata?: DataMetadata;
}

export interface DataUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;

  // Text with TTL
  fields?: Array<{ key: string; value: string }>;
  ttl?: number;

  // Kubernetes
  namespace?: string;
  data?: Array<{ key: string; value: string }>;

  // Credentials
  username?: string;
  password?: string;
  url?: string;

  // API Key
  apiKey?: string;

  // SSH Key
  privateKey?: string;
  publicKey?: string;
  passphrase?: string;
  host?: string;

  // Certificate
  certificate?: string;
  chain?: string;
}
