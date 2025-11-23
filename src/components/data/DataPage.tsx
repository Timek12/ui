import {
  Box,
  Check,
  Copy,
  Cpu,
  Edit2,
  FileText,
  Key,
  Plus,
  Shield,
  Terminal,
  Trash2,
  UserCircle,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDeleteDataMutation,
  useGetDataByIdQuery,
  useGetDataQuery,
  useUpdateDataMutation,
} from "../../services/dataApi";
import type { DataResponse, DataUpdate } from "../../types/data.types";
import Alert from "../common/Alert";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";
import { ApiKeyForm } from "./forms/ApiKeyForm";
import { CertificateForm } from "./forms/CertificateForm";
import { CredentialsForm } from "./forms/CredentialsForm";
import { KubernetesForm } from "./forms/KubernetesForm";
import { SshKeyForm } from "./forms/SshKeyForm";
import { TextDataForm } from "./forms/TextDataForm";

const TYPE_BADGES: Record<
  string,
  {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  text_with_ttl: {
    label: "Text",
    Icon: FileText,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  kubernetes: {
    label: "Kubernetes",
    Icon: Box,
    className: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  credentials: {
    label: "Credentials",
    Icon: UserCircle,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  api_key: {
    label: "API Key",
    Icon: Cpu,
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  ssh_key: {
    label: "SSH Key",
    Icon: Terminal,
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  certificate: {
    label: "Certificate",
    Icon: Shield,
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

const getTypeBadge = (type: string) => {
  const badge = TYPE_BADGES[type] || {
    label: type,
    Icon: Key,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const { Icon, label, className } = badge;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${className}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
};

const DataPage: React.FC = () => {
  const { data: dataList, isLoading, error: fetchError } = useGetDataQuery();
  const [updateData] = useUpdateDataMutation();
  const [deleteData] = useDeleteDataMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<DataResponse | null>(null);
  const [editingDataId, setEditingDataId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: fullData,
    error: fetchFullDataError,
    isLoading: isLoadingFullData,
  } = useGetDataByIdQuery(editingDataId || "", {
    skip: !editingDataId,
  });

  const navigate = useNavigate();

  React.useEffect(() => {
    if (fetchFullDataError) {
      setError(
        (fetchFullDataError as any)?.data?.detail ||
          "Failed to load secret data"
      );
      setIsEditModalOpen(false);
      setEditingDataId(null);
    }
    if (fullData) {
      setEditingData(fullData);
      setIsEditModalOpen(true);
    }
  }, [fullData, fetchFullDataError]);

  const handleDeleteData = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteData(id).unwrap();
      setSuccess("Secret deleted successfully!");
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to delete secret");
    }
  };

  const handleEditData = (data: DataResponse) => {
    setEditingDataId(data.id);
  };

  const handleUpdateSubmit = async (formData: any) => {
    if (!editingData) return;

    setError(null);
    setSuccess(null);

    try {
      const updatePayload: DataUpdate = {
        name: formData.name,
        description: formData.description,
      };

      switch (editingData.data_type) {
        case "text_with_ttl":
          updatePayload.fields = formData.fields;
          if (formData.ttl) {
            updatePayload.ttl = formData.ttl;
          }
          break;
        case "kubernetes":
          updatePayload.namespace = formData.namespace;
          updatePayload.data = formData.data;
          break;
        case "credentials":
          updatePayload.username = formData.username;
          updatePayload.password = formData.password;
          updatePayload.url = formData.url;
          break;
        case "api_key":
          updatePayload.apiKey = formData.apiKey;
          break;
        case "ssh_key":
          updatePayload.privateKey = formData.privateKey;
          updatePayload.publicKey = formData.publicKey;
          updatePayload.passphrase = formData.passphrase;
          updatePayload.host = formData.host;
          updatePayload.username = formData.username;
          break;
        case "certificate":
          updatePayload.certificate = formData.certificate;
          updatePayload.privateKey = formData.privateKey;
          updatePayload.passphrase = formData.passphrase;
          updatePayload.chain = formData.chain;
          break;
      }

      await updateData({
        id: editingData.id,
        data: updatePayload,
      }).unwrap();

      setSuccess("Secret updated successfully!");
      setIsEditModalOpen(false);
      setEditingData(null);
      setEditingDataId(null);
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to update secret");
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingData(null);
    setEditingDataId(null);
  };

  const renderEditForm = () => {
    if (!editingData) return null;

    const decrypted = (editingData as any).decrypted_data || {};
    const metadata = (editingData as any).metadata || {};

    const initialData = {
      type: editingData.data_type,
      name: editingData.name,
      description: editingData.description,
    };

    switch (editingData.data_type) {
      case "text_with_ttl":
        return (
          <TextDataForm
            key={editingData.id}
            onSubmit={handleUpdateSubmit}
            onCancel={handleCancelEdit}
            isEditing={true}
            initialData={{
              ...initialData,
              fields: decrypted.fields || [],
              ttl: editingData.ttl_seconds,
            }}
          />
        );
      case "kubernetes":
        return (
          <KubernetesForm
            key={editingData.id}
            onSubmit={handleUpdateSubmit}
            onCancel={handleCancelEdit}
            isEditing={true}
            initialData={{
              ...initialData,
              namespace: metadata.namespace || "",
              data: decrypted.data || [],
            }}
          />
        );
      case "credentials":
        return (
          <CredentialsForm
            key={editingData.id}
            onSubmit={handleUpdateSubmit}
            onCancel={handleCancelEdit}
            isEditing={true}
            initialData={{
              ...initialData,
              username: metadata.username || "",
              password: decrypted.password || "",
              url: metadata.url || "",
            }}
          />
        );
      case "api_key":
        return (
          <ApiKeyForm
            key={editingData.id}
            onSubmit={handleUpdateSubmit}
            onCancel={handleCancelEdit}
            isEditing={true}
            initialData={{
              ...initialData,
              apiKey: decrypted.apiKey || "",
            }}
          />
        );
      case "ssh_key":
        return (
          <SshKeyForm
            key={editingData.id}
            onSubmit={handleUpdateSubmit}
            onCancel={handleCancelEdit}
            isEditing={true}
            initialData={{
              ...initialData,
              privateKey: decrypted.privateKey || "",
              publicKey: decrypted.publicKey || "",
              passphrase: decrypted.passphrase || "",
              host: metadata.host || "",
              username: metadata.username || "",
            }}
          />
        );
      case "certificate":
        return (
          <CertificateForm
            key={editingData.id}
            onSubmit={handleUpdateSubmit}
            onCancel={handleCancelEdit}
            isEditing={true}
            initialData={{
              ...initialData,
              certificate: decrypted.certificate || "",
              privateKey: decrypted.privateKey || "",
              passphrase: decrypted.passphrase || "",
              chain: decrypted.chain || "",
            }}
          />
        );
      default:
        return null;
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" message="Loading secrets..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Secrets</h1>
          <p className="text-gray-600 mt-2">Manage your encrypted secrets</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/create-data")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Secret
        </button>
      </div>

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {fetchError && (
        <Alert
          type="error"
          message={`Failed to load secrets: ${JSON.stringify(fetchError)}`}
          onClose={() => {}}
        />
      )}

      {/* Data List */}
      {dataList && dataList.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {dataList.map((data) => (
            <div key={data.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Key className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {data.name}
                    </h3>
                    {getTypeBadge(data.data_type)}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 font-mono">
                      ID: {data.id}
                    </span>
                    <button
                      onClick={() => copyToClipboard(data.id, `id-${data.id}`)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy ID"
                    >
                      {copiedId === `id-${data.id}` ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                    {data.description || "No description"}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Version: {data.version ?? "N/A"}</span>
                    <span>•</span>
                    <span>
                      Created:{" "}
                      {new Date(data.created_at).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditData(data)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit secret"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteData(data.id, data.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete secret"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No secrets yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first secret
          </p>
          <button
            onClick={() => navigate("/dashboard/create-data")}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Secret
          </button>
        </div>
      )}

      {/* Edit Secret Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title={`Edit Secret - ${editingData?.data_type || ""}`}
        size="lg"
      >
        {isLoadingFullData ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="md" message="Loading secret data..." />
          </div>
        ) : editingData ? (
          renderEditForm()
        ) : (
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DataPage;
