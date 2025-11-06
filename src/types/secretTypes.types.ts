export enum SecretType {
  TEXT_WITH_TTL = "text_with_ttl",
  KUBERNETES = "kubernetes",
  CREDENTIALS = "credentials",
  API_KEY = "api_key",
  SSH_KEY = "ssh_key",
  CERTIFICATE = "certificate",
}

export enum SecretStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
  PENDING = "pending",
}

export interface BaseSecretData {
  name: string;
  description?: string;
}

export interface TextSecretData extends BaseSecretData {
  type: "text_with_ttl";
  fields: { key: string; value: string }[];
  ttl?: number; // seconds
}

export interface KubernetesSecretData extends BaseSecretData {
  type: "kubernetes";
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface CredentialsSecretData extends BaseSecretData {
  type: "credentials";
  username: string;
  password: string;
  url?: string;
}

export interface ApiKeySecretData extends BaseSecretData {
  type: "api_key";
  apiKey: string;
  headers?: { key: string; value: string }[];
}

export interface SshKeySecretData extends BaseSecretData {
  type: "ssh_key";
  privateKey: string;
  publicKey?: string;
  passphrase?: string;
  host?: string;
  username?: string;
}

export interface CertificateSecretData extends BaseSecretData {
  type: "certificate";
  certificate: string;
  privateKey: string;
  chain?: string;
  passphrase?: string;
}

export type TypedSecretData =
  | TextSecretData
  | KubernetesSecretData
  | CredentialsSecretData
  | ApiKeySecretData
  | SshKeySecretData
  | CertificateSecretData;

export const SECRET_TYPE_METADATA = {
  [SecretType.TEXT_WITH_TTL]: {
    label: "Text with TTL",
    description: "Key-value pairs with expiration",
    icon: "📝",
  },
  [SecretType.KUBERNETES]: {
    label: "Kubernetes Secret",
    description: "Database credentials for K8s",
    icon: "☸️",
  },
  [SecretType.CREDENTIALS]: {
    label: "Credentials",
    description: "Username and password",
    icon: "🔑",
  },
  [SecretType.API_KEY]: {
    label: "API Key",
    description: "API key with optional headers",
    icon: "🔌",
  },
  [SecretType.SSH_KEY]: {
    label: "SSH Key",
    description: "SSH private/public key pair",
    icon: "🔐",
  },
  [SecretType.CERTIFICATE]: {
    label: "Certificate",
    description: "SSL/TLS certificate and key",
    icon: "📜",
  },
};
