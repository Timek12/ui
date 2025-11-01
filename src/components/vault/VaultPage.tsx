import { AlertCircle, Lock, Shield, Unlock } from "lucide-react";
import React, { useState } from "react";
import {
  useGetVaultStatusQuery,
  useInitVaultMutation,
  useSealVaultMutation,
  useUnsealVaultMutation,
} from "../../services/vaultApi";
import Alert from "../common/Alert";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";

const VaultPage: React.FC = () => {
  const { data: vaultStatus, isLoading, refetch } = useGetVaultStatusQuery();
  const [initVault] = useInitVaultMutation();
  const [unsealVault] = useUnsealVaultMutation();
  const [sealVault] = useSealVaultMutation();

  const [isInitModalOpen, setIsInitModalOpen] = useState(false);
  const [isUnsealModalOpen, setIsUnsealModalOpen] = useState(false);
  const [externalToken, setExternalToken] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInitVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsProcessing(true);

    try {
      await initVault({ external_token: externalToken }).unwrap();
      setSuccess(
        "Vault initialized successfully! Please store your external token safely."
      );
      setIsInitModalOpen(false);
      setExternalToken("");
      refetch();
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to initialize vault");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsealVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsProcessing(true);

    try {
      await unsealVault({ external_token: externalToken }).unwrap();
      setSuccess("Vault unsealed successfully!");
      setIsUnsealModalOpen(false);
      setExternalToken("");
      refetch();
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to unseal vault");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSealVault = async () => {
    if (
      !confirm(
        "Are you sure you want to seal the vault? All crypto operations will be disabled."
      )
    )
      return;

    setError(null);
    setSuccess(null);

    try {
      await sealVault().unwrap();
      setSuccess("Vault sealed successfully!");
      refetch();
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to seal vault");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" message="Loading vault status..." />
      </div>
    );
  }

  const vault = vaultStatus?.vault;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vault Management</h1>
        <p className="text-gray-600 mt-2">
          Initialize, unseal, and manage your cryptographic vault
        </p>
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

      {/* Vault Status Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Vault Status</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Initialization</p>
            <p
              className={`text-lg font-semibold ${
                vault?.initialized ? "text-green-600" : "text-red-600"
              }`}
            >
              {vault?.initialized ? "Initialized" : "Not Initialized"}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">State</p>
            <p
              className={`text-lg font-semibold ${
                vault?.sealed ? "text-red-600" : "text-green-600"
              }`}
            >
              {vault?.sealed ? "Sealed" : "Unsealed"}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Version</p>
            <p className="text-lg font-semibold text-gray-900">
              {vault?.version || "N/A"}
            </p>
          </div>
        </div>

        {/* Status Information */}
        {!vault?.initialized && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Vault Not Initialized
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The vault needs to be initialized before you can use it. This
                  is a one-time operation.
                </p>
              </div>
            </div>
          </div>
        )}

        {vault?.initialized && vault?.sealed && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800">Vault Sealed</h3>
                <p className="text-sm text-blue-700 mt-1">
                  The vault is sealed. Unseal it to perform cryptographic
                  operations.
                </p>
              </div>
            </div>
          </div>
        )}

        {vault?.initialized && !vault?.sealed && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <Unlock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800">Vault Unsealed</h3>
                <p className="text-sm text-green-700 mt-1">
                  The vault is unsealed and ready for cryptographic operations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!vault?.initialized && (
            <button
              onClick={() => setIsInitModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Initialize Vault
            </button>
          )}

          {vault?.initialized && vault?.sealed && (
            <button
              onClick={() => setIsUnsealModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Unlock className="w-5 h-5" />
              Unseal Vault
            </button>
          )}

          {vault?.initialized && !vault?.sealed && (
            <button
              onClick={handleSealVault}
              className="btn-danger flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Seal Vault
            </button>
          )}
        </div>
      </div>

      {/* Initialize Vault Modal */}
      <Modal
        isOpen={isInitModalOpen}
        onClose={() => setIsInitModalOpen(false)}
        title="Initialize Vault"
        size="md"
      >
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• This is a one-time operation</li>
            <li>• Store your external token safely - you cannot recover it</li>
            <li>• The external token is required to unseal the vault</li>
            <li>• Use a strong, random token (minimum 8 characters)</li>
          </ul>
        </div>

        <form onSubmit={handleInitVault} className="space-y-4">
          <div>
            <label htmlFor="init-token" className="label">
              External Token *
            </label>
            <input
              id="init-token"
              type="password"
              value={externalToken}
              onChange={(e) => setExternalToken(e.target.value)}
              required
              minLength={8}
              className="input font-mono"
              placeholder="Enter a strong external token"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary flex-1"
            >
              {isProcessing ? <LoadingSpinner size="sm" /> : "Initialize Vault"}
            </button>
            <button
              type="button"
              onClick={() => setIsInitModalOpen(false)}
              disabled={isProcessing}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Unseal Vault Modal */}
      <Modal
        isOpen={isUnsealModalOpen}
        onClose={() => setIsUnsealModalOpen(false)}
        title="Unseal Vault"
        size="md"
      >
        <form onSubmit={handleUnsealVault} className="space-y-4">
          <div>
            <label htmlFor="unseal-token" className="label">
              External Token *
            </label>
            <input
              id="unseal-token"
              type="password"
              value={externalToken}
              onChange={(e) => setExternalToken(e.target.value)}
              required
              className="input font-mono"
              placeholder="Enter your external token"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the same token you used during initialization
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary flex-1"
            >
              {isProcessing ? <LoadingSpinner size="sm" /> : "Unseal Vault"}
            </button>
            <button
              type="button"
              onClick={() => setIsUnsealModalOpen(false)}
              disabled={isProcessing}
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

export default VaultPage;
