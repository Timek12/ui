import { Activity, Key, Lock } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useGetSecretsQuery } from "../../services/secretsApi";
import { useGetVaultStatusQuery } from "../../services/vaultApi";
import { RootState } from "../../store";
import LoadingSpinner from "../common/LoadingSpinner";

const DashboardHome: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "admin";

  const { data: vaultStatus, isLoading: vaultLoading } =
    useGetVaultStatusQuery();
  const { data: secrets, isLoading: secretsLoading } = useGetSecretsQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const stats = [
    {
      title: "Total Secrets",
      value: secrets?.length || 0,
      icon: Key,
      color: "bg-blue-500",
      link: "/dashboard/secrets",
    },
    ...(isAdmin
      ? [
          {
            title: "Vault Status",
            value: vaultStatus?.vault.sealed ? "Sealed" : "Unsealed",
            icon: Lock,
            color: vaultStatus?.vault.sealed ? "bg-red-500" : "bg-green-500",
            link: "/dashboard/vault",
          },
        ]
      : []),
    {
      title: "Active Secrets",
      value: secrets?.filter((s) => s.is_active).length || 0,
      icon: Activity,
      color: "bg-purple-500",
      link: "/dashboard/secrets",
    },
  ];

  if (vaultLoading || secretsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to LunaGuard Secret Management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Vault Status Card - Admin Only */}
      {isAdmin && vaultStatus && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Vault Information
            </h2>
            <Link
              to="/dashboard/vault"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Manage Vault →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {vaultStatus?.vault.initialized
                  ? "Initialized"
                  : "Not Initialized"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">State</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {vaultStatus?.vault.sealed ? "Sealed" : "Unsealed"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Version</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {vaultStatus?.vault.version || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Secrets */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Secrets
          </h2>
          <Link
            to="/dashboard/secrets"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </Link>
        </div>

        {secrets && secrets.length > 0 ? (
          <div className="space-y-3">
            {secrets.slice(0, 5).map((secret) => (
              <div
                key={secret.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{secret.name}</p>
                    <p className="text-sm text-gray-500">
                      {secret.description || "No description"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  Updated {new Date(secret.updated_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No secrets yet</p>
            <Link
              to="/dashboard/secrets"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
            >
              Create your first secret
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
