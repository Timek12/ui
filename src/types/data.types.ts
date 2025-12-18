// Secret types (kept as DataType for API compatibility)
export type DataType =
  | "text"
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
  rotation_interval_days?: number;

  // Text
  fields?: Array<{ key: string; value: string }>;

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

  decrypted_data: {
    // Text
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
  project_id?: string;
  decrypt_error?: string;
  rotation_interval_days?: number;
  next_rotation_date?: string;
}

export interface DataUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
  rotation_interval_days?: number;

  // Text
  fields?: Array<{ key: string; value: string }>;

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
  project_id?: string;
}

export interface DataListItem {
  id: string;
  user_id: number;
  name: string;
  description: string;
  data_type: DataType;
  version: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  metadata?: DataMetadata;
  rotation_interval_days?: number;
  next_rotation_date?: string;
}
