import { Key, Shield, Trash2 } from "lucide-react";
import React, { useState } from "react";
import {
  useDeleteAnySecretMutation,
  useGetAllSecretsQuery,
} from "../../services/adminApi";
import Alert from "../common/Alert";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";

const AdminSecretsPage: React.FC = () => {
  const { data: secrets, isLoading, error } = useGetAllSecretsQuery();
  const [deleteSecret] = useDeleteAnySecretMutation();

  const [selectedSecret, setSelectedSecret] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleDeleteSecret = async () => {
    if (!selectedSecret) return;

    try {
      await deleteSecret(selectedSecret).unwrap();
      setMessage({ type: "success", text: "Secret deleted successfully" });
      setShowDeleteModal(false);
      setSelectedSecret(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.data?.detail || "Failed to delete secret",
      });
      setShowDeleteModal(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" message="Loading secrets..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message="Failed to load secrets. Please try again." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Secrets Management
          </h1>
          <p className="text-gray-600 mt-2">View and manage all user secrets</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>Admin Only</span>
        </div>
      </div>

      {message && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <div className="card">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            All Secrets ({secrets?.length || 0})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {secrets?.map((secret) => (
                <tr key={secret.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Key className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {secret.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {secret.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {secret.user_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      v{secret.version}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(secret.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(secret.updated_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedSecret(secret.id);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Delete secret"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {secrets && secrets.length === 0 && (
          <div className="text-center py-12">
            <Key className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No secrets found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSecret(null);
        }}
        title="Delete Secret"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this secret? This action cannot be
            undone and will permanently remove the secret from the system.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedSecret(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleDeleteSecret} className="btn-danger">
              Delete Secret
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSecretsPage;
