import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface CertificateFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
  initialData?: {
    name?: string;
    description?: string;
    certificate?: string;
    privateKey?: string;
    chain?: string;
    passphrase?: string;
  };
}

export const CertificateForm: React.FC<CertificateFormProps> = ({
  onSubmit,
  onCancel,
  isEditing = false,
  initialData,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [certificate, setCertificate] = useState(
    initialData?.certificate || ""
  );
  const [privateKey, setPrivateKey] = useState(initialData?.privateKey || "");
  const [chain, setChain] = useState(initialData?.chain || "");
  const [passphrase, setPassphrase] = useState(initialData?.passphrase || "");
  const [showPassphrase, setShowPassphrase] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setCertificate(initialData.certificate || "");
      setPrivateKey(initialData.privateKey || "");
      setChain(initialData.chain || "");
      setPassphrase(initialData.passphrase || "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: "certificate",
      name,
      description,
      certificate,
      privateKey,
      chain: chain || undefined,
      passphrase: passphrase || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('forms.secretName')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., SSL Certificate"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('forms.description')}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('forms.certificate')}
        </label>
        <textarea
          value={certificate}
          onChange={(e) => setCertificate(e.target.value)}
          required
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
          placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('forms.privateKey')}
        </label>
        <textarea
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          required
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
          placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('forms.chain')}
        </label>
        <textarea
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
          placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('forms.passphrase')}
        </label>
        <div className="relative">
          <input
            type={showPassphrase ? "text" : "password"}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={() => setShowPassphrase(!showPassphrase)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassphrase ? t('forms.hide') : t('forms.show')}
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          {isEditing ? t('forms.update') : t('forms.create')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          {t('forms.cancel')}
        </button>
      </div>
    </form>
  );
};
