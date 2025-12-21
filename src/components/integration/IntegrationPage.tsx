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
          {t('integrations.title', 'Integrations & CLI')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('integrations.subtitle', 'Connect Luna with your CI/CD pipelines using our CLI tool.')}
        </p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Luna CLI
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('integrations.description', 'The Luna CLI allows you to securely fetch secrets during your build process. It supports JSON and Env output formats.')}
        </p>

        <div className="bg-gray-900 rounded-lg p-4 mb-6 overflow-x-auto">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Installation</h3>
            <code className="text-green-400 font-mono text-sm block mb-2">
                # 1. Download the script (luna_cli.py)
            </code>
            <code className="text-green-400 font-mono text-sm block mb-4">
                # 2. Make it executable: chmod +x luna_cli.py
            </code>
            
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Usage Example</h3>
            <code className="text-white font-mono text-sm">
                export LUNA_USERNAME="myuser"<br/>
                export LUNA_PASSWORD="mypassword"<br/>
                <br/>
                # Fetch secret by name and output as env vars<br/>
                ./luna_cli.py --secret-name "Prod DB" --format env &gt; .env
            </code>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPage;
