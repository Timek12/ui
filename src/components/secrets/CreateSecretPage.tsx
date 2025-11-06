import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiKeyForm } from "./forms/ApiKeyForm";
import { CertificateForm } from "./forms/CertificateForm";
import { CredentialsForm } from "./forms/CredentialsForm";
import { KubernetesForm } from "./forms/KubernetesForm";
import { SshKeyForm } from "./forms/SshKeyForm";
import { TextSecretForm } from "./forms/TextSecretForm";

type SecretType =
  | "text_with_ttl"
  | "kubernetes"
  | "credentials"
  | "api_key"
  | "ssh_key"
  | "certificate";

interface SecretTypeOption {
  value: SecretType;
  label: string;
  description: string;
  icon: string;
}

const SECRET_TYPES: SecretTypeOption[] = [
  {
    value: "text_with_ttl",
    label: "Text with optional TTL",
    description: "Key-value pairs with optional expiration",
    icon: "📝",
  },
  {
    value: "kubernetes",
    label: "Kubernetes Secret",
    description: "Configuration data for K8s deployments",
    icon: "☸️",
  },
  {
    value: "credentials",
    label: "Credentials",
    description: "Username and password",
    icon: "🔑",
  },
  {
    value: "api_key",
    label: "API Key",
    description: "API key with optional headers",
    icon: "🔌",
  },
  {
    value: "ssh_key",
    label: "SSH Key",
    description: "SSH private/public key pair",
    icon: "🔐",
  },
  {
    value: "certificate",
    label: "Certificate",
    description: "SSL/TLS certificate and key",
    icon: "📜",
  },
];

export const CreateSecretPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<SecretType | null>(null);

  const handleSubmit = async (data: any) => {
    console.log("Creating secret:", data);
    // Mock API call - will be replaced with actual RTK Query mutation
    alert(
      `Secret "${data.name}" of type "${data.type}" created successfully! (Mocked)`
    );
    navigate("/dashboard/secrets");
  };

  const handleCancel = () => {
    if (selectedType) {
      setSelectedType(null);
    } else {
      navigate("/dashboard/secrets");
    }
  };

  const renderForm = () => {
    switch (selectedType) {
      case "text_with_ttl":
        return (
          <TextSecretForm onSubmit={handleSubmit} onCancel={handleCancel} />
        );
      case "kubernetes":
        return (
          <KubernetesForm onSubmit={handleSubmit} onCancel={handleCancel} />
        );
      case "credentials":
        return (
          <CredentialsForm onSubmit={handleSubmit} onCancel={handleCancel} />
        );
      case "api_key":
        return <ApiKeyForm onSubmit={handleSubmit} onCancel={handleCancel} />;
      case "ssh_key":
        return <SshKeyForm onSubmit={handleSubmit} onCancel={handleCancel} />;
      case "certificate":
        return (
          <CertificateForm onSubmit={handleSubmit} onCancel={handleCancel} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 dark:border dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Create New Secret
        </h1>

        {!selectedType ? (
          <div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Select the type of secret you want to create:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECRET_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className="flex items-start gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left"
                >
                  <span className="text-3xl">{type.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                      {type.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {type.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate("/dashboard/secrets")}
              className="mt-6 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              ← Back to Secrets
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <button
                onClick={() => setSelectedType(null)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                ← Change Type
              </button>
              <span className="text-gray-400 dark:text-gray-500">|</span>
              <span className="text-gray-600 dark:text-gray-300">
                Creating:{" "}
                <strong>
                  {SECRET_TYPES.find((t) => t.value === selectedType)?.label}
                </strong>
              </span>
            </div>
            {renderForm()}
          </div>
        )}
      </div>
    </div>
  );
};
