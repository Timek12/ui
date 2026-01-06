import { Terminal } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const IntegrationPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Terminal className="w-8 h-8 text-primary-600" />
          {t('integrations.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('integrations.subtitle')}
        </p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('integrations.lunaCli')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('integrations.description')}
        </p>

        <div className="bg-gray-900 rounded-lg p-4 mb-6 overflow-x-auto">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">{t('integrations.installation')}</h3>
            <code className="text-green-400 font-mono text-sm block mb-2">
                {t('integrations.downloadScript')}
            </code>
            <code className="text-green-400 font-mono text-sm block mb-4">
                {t('integrations.makeExecutable')}
            </code>
            
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">{t('integrations.usageExample')}</h3>
            <code className="text-white font-mono text-sm">
                export LUNA_USERNAME="myuser"<br/>
                export LUNA_PASSWORD="mypassword"<br/>
                <br/>
                {t('integrations.fetchSecretExample')}<br/>
                ./luna_cli.py --secret-name "Prod DB" --format env &gt; .env
            </code>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPage;
