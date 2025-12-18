import { AlertTriangle, Check, Loader2, Shield } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCheckLeakMutation } from "../../../services/securityApi";

interface CredentialsFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
  initialData?: {
    name?: string;
    description?: string;
    username?: string;
    password?: string;
    url?: string;
  };
}

export const CredentialsForm: React.FC<CredentialsFormProps> = ({
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
  const [username, setUsername] = useState(initialData?.username || "");
  const [password, setPassword] = useState(initialData?.password || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [showPassword, setShowPassword] = useState(false);

  // Leak Check
  const [checkLeak, { isLoading: isCheckingLeak }] = useCheckLeakMutation();
  const [leakResult, setLeakResult] = useState<{ is_leaked: boolean; count: number } | null>(null);
  const [leakCheckError, setLeakCheckError] = useState<string | null>(null);

  const handleCheckLeak = async () => {
    if (!password) return;
    setLeakResult(null);
    setLeakCheckError(null);
    try {
      const result = await checkLeak({ password }).unwrap();
      setLeakResult(result);
    } catch (err) {
      console.error("Leak check failed", err);
      setLeakCheckError(t('secrets.leakCheckFailed', 'Failed to check for leaks. Please try again.'));
    }
  };

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setUsername(initialData.username || "");
      setPassword(initialData.password || "");
      setUrl(initialData.url || "");
    }
  }, [initialData]);

  // Reset leak result when password changes
  React.useEffect(() => {
     setLeakResult(null);
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: "credentials",
      name,
      description,
      username,
      password,
      url: url || undefined,
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
          placeholder="e.g., Production Database"
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
          {t('forms.username')}
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('forms.password')}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 pr-20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
             <button
                type="button"
                onClick={handleCheckLeak}
                disabled={!password || isCheckingLeak}
                className="text-gray-500 hover:text-primary-600 p-1 rounded-md transition-colors"
                title={t('common.checkLeak', 'Check for leaks')}
             >
                {isCheckingLeak ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
             </button>
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 p-1"
                title={showPassword ? t('forms.hide') : t('forms.show')}
             >
                {showPassword ? t('forms.hide', 'Hide') : t('forms.show', 'Show')}
             </button>
          </div>
        </div>
        
        {leakCheckError && (
             <div className="mt-2 text-xs text-red-600 flex items-center gap-2">
                 <AlertTriangle className="w-3 h-3" />
                 <span>{leakCheckError}</span>
             </div>
        )}
        
        {leakResult && (
            <div className={`mt-2 text-xs flex items-center gap-2 ${leakResult.is_leaked ? "text-red-600 font-medium" : "text-green-600 font-medium"}`}>
                {leakResult.is_leaked ? (
                    <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>
                            {t('secrets.leakDetected', 'Warning: This password has been exposed {{count}} times!', { count: leakResult.count })}
                        </span>
                    </>
                ) : (
                    <>
                        <Check className="w-3 h-3" />
                        <span>{t('secrets.leakSafe', 'Good news! No leaks detected for this password.')}</span>
                    </>
                )}
            </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('forms.url')}
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="https://example.com"
        />
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
