import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  className?: string;
}

// Map backend error messages to translation keys
const ERROR_MESSAGE_MAP: Record<string, string> = {
  "Vault is sealed. Please unseal the vault first.": "vault.sealedError",
  "Vault is sealed. Cannot update data value.": "vault.sealedError",
  "No master key available. Vault may need to be unsealed.": "vault.sealedError",
  "No master key available.": "vault.sealedError",
};

const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = "" }) => {
  const { t } = useTranslation();
  
  const styles = {
    success: "bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300",
    error: "bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-600 dark:text-red-300",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-300",
    info: "bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300",
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];

  // Translate backend error messages
  const translationKey = ERROR_MESSAGE_MAP[message];
  const displayMessage = translationKey ? t(translationKey) : message;

  return (
    <div
      className={`border-l-4 p-4 rounded-lg ${styles[type]} flex items-start gap-3 ${className}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1">{displayMessage}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 transition-opacity"
          aria-label={t('common.close')}
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
