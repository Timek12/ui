import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = "" }) => {
  const { t } = useTranslation();
  const styles = {
    success: "bg-green-50 border-green-500 text-green-800",
    error: "bg-red-50 border-red-500 text-red-800",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
    info: "bg-blue-50 border-blue-500 text-blue-800",
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];

  // Intercept backend error messages and translate them
  let displayMessage = message;
  if (message === "Vault is sealed. Please unseal the vault first.") {
    displayMessage = t('vault.sealedError');
  }

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
