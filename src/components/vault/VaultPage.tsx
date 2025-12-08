import { AlertCircle, Lock, Shield, Unlock } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { data: vaultStatus, isLoading, refetch } = useGetVaultStatusQuery();
  const [initVault] = useInitVaultMutation();
  const [unsealVault] = useUnsealVaultMutation();
  const [sealVault] = useSealVaultMutation();

  const [isInitModalOpen, setIsInitModalOpen] = useState(false);
  const [isUnsealModalOpen, setIsUnsealModalOpen] = useState(false);
  const [isSealModalOpen, setIsSealModalOpen] = useState(false);
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
      setSuccess(t('vault.initSuccess'));
      setIsInitModalOpen(false);
      setExternalToken("");
      refetch();
    } catch (err: any) {
      setError(err?.data?.detail || t('vault.initError'));
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
      setSuccess(t('vault.unsealSuccess'));
      setIsUnsealModalOpen(false);
      setExternalToken("");
      refetch();
    } catch (err: any) {
      setError(err?.data?.detail || t('vault.unsealError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSealVault = () => {
    setIsSealModalOpen(true);
  };

  const handleSealConfirm = async () => {
    setError(null);
    setSuccess(null);
    setIsProcessing(true);

    try {
      await sealVault().unwrap();
      setSuccess(t('vault.sealSuccess'));
      setIsSealModalOpen(false);
      refetch();
    } catch (err: any) {
      setError(err?.data?.detail || t('vault.sealError'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" message={t('vault.loadingStatus')} />
      </div>
    );
  }

  const vault = vaultStatus?.vault;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('vault.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {t('vault.description')}
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
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('vault.statusTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {t('vault.initialization')}
            </p>
            <p
              className={`text-lg font-semibold ${
                vault?.initialized ? "text-green-600" : "text-red-600"
              }`}
            >
              {vault?.initialized ? t('vault.initialized') : t('vault.notInitialized')}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {t('vault.state')}
            </p>
            <p
              className={`text-lg font-semibold ${
                vault?.sealed ? "text-red-600" : "text-green-600"
              }`}
            >
              {vault?.sealed ? t('vault.sealed') : t('vault.unsealed')}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {t('vault.version')}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
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
                  {t('vault.notInitializedTitle')}
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {t('vault.notInitializedDesc')}
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
                <h3 className="font-semibold text-blue-800">{t('vault.sealedTitle')}</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {t('vault.sealedDesc')}
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
                <h3 className="font-semibold text-green-800">{t('vault.unsealedTitle')}</h3>
                <p className="text-sm text-green-700 mt-1">
                  {t('vault.unsealedDesc')}
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
              {t('vault.initButton')}
            </button>
          )}

          {vault?.initialized && vault?.sealed && (
            <button
              onClick={() => setIsUnsealModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Unlock className="w-5 h-5" />
              {t('vault.unsealButton')}
            </button>
          )}

          {vault?.initialized && !vault?.sealed && (
            <button
              onClick={handleSealVault}
              className="btn-danger flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              {t('vault.sealButton')}
            </button>
          )}
        </div>
      </div>

      {/* Initialize Vault Modal */}
      <Modal
        isOpen={isInitModalOpen}
        onClose={() => setIsInitModalOpen(false)}
        title={t('vault.initModalTitle')}
        size="md"
      >
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            ⚠️ {t('vault.important')}
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
            <li>• {t('vault.oneTimeOp')}</li>
            <li>• {t('vault.storeToken')}</li>
            <li>• {t('vault.tokenRequired')}</li>
          </ul>
        </div>

        <form onSubmit={handleInitVault} className="space-y-4">
          <div>
            <label htmlFor="init-token" className="label">
              {t('vault.externalToken')} *
            </label>
            <input
              id="init-token"
              type="password"
              value={externalToken}
              onChange={(e) => setExternalToken(e.target.value)}
              required
              minLength={32}
              className="input font-mono"
              placeholder={t('vault.enterToken')}
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('vault.minChars')}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary flex-1"
            >
              {isProcessing ? <LoadingSpinner size="sm" /> : t('vault.initButton')}
            </button>
            <button
              type="button"
              onClick={() => setIsInitModalOpen(false)}
              disabled={isProcessing}
              className="btn-secondary flex-1"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Unseal Vault Modal */}
      <Modal
        isOpen={isUnsealModalOpen}
        onClose={() => setIsUnsealModalOpen(false)}
        title={t('vault.unsealModalTitle')}
        size="md"
      >
        <form onSubmit={handleUnsealVault} className="space-y-4">
          <div>
            <label htmlFor="unseal-token" className="label">
              {t('vault.externalToken')} *
            </label>
            <input
              id="unseal-token"
              type="password"
              value={externalToken}
              onChange={(e) => setExternalToken(e.target.value)}
              required
              className="input font-mono"
              placeholder={t('vault.enterUnsealToken')}
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('vault.sameToken')}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary flex-1"
            >
              {isProcessing ? <LoadingSpinner size="sm" /> : t('vault.unsealButton')}
            </button>
            <button
              type="button"
              onClick={() => setIsUnsealModalOpen(false)}
              disabled={isProcessing}
              className="btn-secondary flex-1"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Seal Vault Modal */}
      <Modal
        isOpen={isSealModalOpen}
        onClose={() => setIsSealModalOpen(false)}
        title={t('vault.sealButton')}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {t('vault.sealConfirm')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSealConfirm}
              disabled={isProcessing}
              className="btn-danger flex-1"
            >
              {isProcessing ? <LoadingSpinner size="sm" /> : t('vault.sealButton')}
            </button>
            <button
              onClick={() => setIsSealModalOpen(false)}
              disabled={isProcessing}
              className="btn-secondary flex-1"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VaultPage;
