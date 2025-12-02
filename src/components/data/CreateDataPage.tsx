import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateDataMutation } from "../../services/dataApi";
import { useListProjectsQuery } from "../../services/projectsApi";
import type { DataCreateRequest } from "../../types/data.types";
import Alert from "../common/Alert";
import { ApiKeyForm } from "./forms/ApiKeyForm";
import { CertificateForm } from "./forms/CertificateForm";
import { CredentialsForm } from "./forms/CredentialsForm";
import { KubernetesForm } from "./forms/KubernetesForm";
import { SshKeyForm } from "./forms/SshKeyForm";
import { TextDataForm } from "./forms/TextDataForm";

type DataType =
  | "text"
  | "kubernetes"
  | "credentials"
  | "api_key"
  | "ssh_key"
  | "certificate";

interface DataTypeOption {
  value: DataType;
  label: string;
  description: string;
  icon: string;
}

const DATA_TYPES: DataTypeOption[] = [
  {
    value: "text",
    label: "Text",
    description: "Key-value pairs",
    icon: "📝",
  },
  {
    value: "kubernetes",
    label: "Kubernetes Secret",
    description: "Configuration secrets for K8s deployments",
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

export const CreateDataPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get("projectId");
  
  const { data: projects } = useListProjectsQuery();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || "");
  
  const [createData] = useCreateDataMutation();
  const [selectedType, setSelectedType] = useState<DataType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const typeToLabel = useMemo(
    () =>
      DATA_TYPES.reduce<Record<DataType, string>>((acc, item) => {
        acc[item.value] = item.label;
        return acc;
      }, {} as Record<DataType, string>),
    []
  );

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      const request = mapFormDataToRequest(data);
      await createData({ ...request, projectId: selectedProjectId || undefined }).unwrap();
      navigate(selectedProjectId ? `/dashboard/data?projectId=${selectedProjectId}` : "/dashboard/data");
    } catch (err: any) {
      console.error("Failed to create data", err);
      setError(
        err?.data?.detail || "Failed to create secret. Please try again."
      );
    }
  };

  const handleCancel = () => {
    if (selectedType) {
      setSelectedType(null);
      setError(null);
    } else {
      navigate(selectedProjectId ? `/dashboard/data?projectId=${selectedProjectId}` : "/dashboard/data");
    }
  };

  const mapFormDataToRequest = (formData: any): DataCreateRequest => {
    const { type, name, description, ...rest } = formData;

    const normalizeOptional = (value?: string) =>
      typeof value === "string" && value.trim() ? value : undefined;

    const request: DataCreateRequest = {
      name,
      data_type: type,
      ...(normalizeOptional(description) && {
        description: normalizeOptional(description),
      }),
    };

    switch (type as DataType) {
      case "text": {
        request.fields = rest.fields ?? [];
        break;
      }
      case "kubernetes": {
        request.namespace = rest.namespace;
        request.data = rest.data ?? [];
        break;
      }
      case "credentials": {
        request.username = rest.username;
        request.password = rest.password;
        const url = normalizeOptional(rest.url);
        if (url) request.url = url;
        break;
      }
      case "api_key": {
        request.apiKey = rest.apiKey;
        break;
      }
      case "ssh_key": {
        request.privateKey = rest.privateKey;
        const publicKey = normalizeOptional(rest.publicKey);
        const passphrase = normalizeOptional(rest.passphrase);
        const host = normalizeOptional(rest.host);
        const username = normalizeOptional(rest.username);

        if (publicKey) request.publicKey = publicKey;
        if (passphrase) request.passphrase = passphrase;
        if (host) request.host = host;
        if (username) request.username = username;
        break;
      }
      case "certificate": {
        request.certificate = rest.certificate;
        request.privateKey = rest.privateKey;
        const chain = normalizeOptional(rest.chain);
        const passphrase = normalizeOptional(rest.passphrase);

        if (chain) request.chain = chain;
        if (passphrase) request.passphrase = passphrase;
        break;
      }
      default:
        break;
    }

    return request;
  };

  const renderForm = () => {
    switch (selectedType) {
      case "text":
        return <TextDataForm onSubmit={handleSubmit} onCancel={handleCancel} />;
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

        {error && (
          <div className="mb-4">
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign to Project
            </label>
            <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
                <option value="">Personal</option>
                {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                        {project.name}
                    </option>
                ))}
            </select>
        </div>

        {!selectedType ? (
          <div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Select the type of secret you want to create:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DATA_TYPES.map((type) => (
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
              onClick={() => navigate("/dashboard/data")}
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
                <strong>{selectedType ? typeToLabel[selectedType] : ""}</strong>
              </span>
            </div>
            {renderForm()}
          </div>
        )}
      </div>
    </div>
  );
};
