import {
  Check,
  Copy,
  Edit2,
  Eye,
  EyeOff,
  Key,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import {
  useCreateSecretMutation,
  useDeleteSecretMutation,
  useGetSecretsQuery,
  useUpdateSecretMutation,
} from "../../services/secretsApi";
import type {
  SecretCreateRequest,
  SecretResponse,
} from "../../types/secret.types";
import Alert from "../common/Alert";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";

const SecretsPage: React.FC = () => {
  const { data: secrets, isLoading, error: fetchError } = useGetSecretsQuery();
  const [createSecret] = useCreateSecretMutation();
  const [updateSecret] = useUpdateSecretMutation();
  const [deleteSecret] = useDeleteSecretMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<SecretResponse | null>(
    null
  );
  const [formData, setFormData] = useState<SecretCreateRequest>({
    name: "",
    value: "",
    description: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    value: "",
    description: "",
  });
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await createSecret(formData).unwrap();
      setSuccess("Secret created successfully!");
      setIsCreateModalOpen(false);
      setFormData({ name: "", value: "", description: "" });
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to create secret");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSecret = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteSecret(id).unwrap();
      setSuccess("Secret deleted successfully!");
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to delete secret");
    }
  };

  const handleEditSecret = (secret: SecretResponse) => {
    setEditingSecret(secret);
    setEditFormData({
      name: secret.name,
      value: (secret as any).decrypted_value || "",
      description: secret.description,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSecret) return;

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await updateSecret({
        id: editingSecret.id,
        data: editFormData,
      }).unwrap();
      setSuccess("Secret updated successfully!");
      setIsEditModalOpen(false);
      setEditingSecret(null);
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to update secret");
    } finally {
      setIsSubmitting(false);
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

  const toggleShowValue = (id: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
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
          onClick={() => setIsCreateModalOpen(true)}
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

      {/* Secrets List */}
      {secrets && secrets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {secrets.map((secret) => (
            <div key={secret.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Key className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {secret.name}
                    </h3>
                  </div>

                  {/* Secret ID with copy button */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 font-mono">
                      ID: {secret.id}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(secret.id, `id-${secret.id}`)
                      }
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy ID"
                    >
                      {copiedId === `id-${secret.id}` ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                    {secret.description || "No description"}
                  </p>

                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-700 break-all flex-1">
                        {showValues[secret.id]
                          ? (secret as any).decrypted_value ||
                            secret.encrypted_value ||
                            "Unable to decrypt"
                          : "••••••••••••••••"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            copyToClipboard(
                              showValues[secret.id]
                                ? (secret as any).decrypted_value ||
                                    secret.encrypted_value
                                : secret.encrypted_value,
                              `value-${secret.id}`
                            )
                          }
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy value"
                        >
                          {copiedId === `value-${secret.id}` ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleShowValue(secret.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title={
                            showValues[secret.id] ? "Hide value" : "Show value"
                          }
                        >
                          {showValues[secret.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {(secret as any).decrypt_error && (
                      <p className="text-xs text-red-600 mt-2">
                        Decryption error: {(secret as any).decrypt_error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Version: {secret.version}</span>
                    <span>•</span>
                    <span>
                      Created:{" "}
                      {new Date(secret.created_at).toLocaleDateString("en-GB")}
                    </span>
                    {secret.access_count !== undefined && (
                      <>
                        <span>•</span>
                        <span>Access Count: {secret.access_count}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditSecret(secret)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit secret"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSecret(secret.id, secret.name)}
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
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Secret
          </button>
        </div>
      )}

      {/* Create Secret Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Secret"
        size="md"
      >
        <form onSubmit={handleCreateSecret} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">
              Secret Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="input"
              placeholder="e.g., AWS_SECRET_KEY"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="value" className="label">
              Secret Value *
            </label>
            <textarea
              id="value"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              required
              className="input font-mono"
              rows={4}
              placeholder="Enter your secret value"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input"
              placeholder="Brief description of this secret"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : "Create Secret"}
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Secret Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSecret(null);
        }}
        title="Edit Secret"
        size="md"
      >
        <form onSubmit={handleUpdateSecret} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="label">
              Secret Name *
            </label>
            <input
              id="edit-name"
              type="text"
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              required
              className="input"
              placeholder="e.g., AWS_SECRET_KEY"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="edit-value" className="label">
              Secret Value *
            </label>
            <textarea
              id="edit-value"
              value={editFormData.value}
              onChange={(e) =>
                setEditFormData({ ...editFormData, value: e.target.value })
              }
              required
              className="input font-mono"
              rows={4}
              placeholder="Enter your secret value"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="label">
              Description
            </label>
            <input
              id="edit-description"
              type="text"
              value={editFormData.description}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  description: e.target.value,
                })
              }
              className="input"
              placeholder="Brief description of this secret"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : "Update Secret"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingSecret(null);
              }}
              disabled={isSubmitting}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SecretsPage;
