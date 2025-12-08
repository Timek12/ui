import { Activity, Clock, Folder, Key, Lock, Plus, Shield, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useGetLogsQuery } from "../../services/auditApi";
import { useGetDataQuery } from "../../services/dataApi";
import { useListProjectsQuery } from "../../services/projectsApi";
import { useGetVaultStatusQuery } from "../../services/vaultApi";
import { RootState } from "../../store";
import LoadingSpinner from "../common/LoadingSpinner";

const DashboardHome: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "admin";

  const { data: vaultStatus, isLoading: vaultLoading } = useGetVaultStatusQuery(undefined, { skip: !isAdmin });
  const { data: dataItems, isLoading: dataLoading } = useGetDataQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: projects, isLoading: projectsLoading } = useListProjectsQuery();
  const { data: auditData, isLoading: auditLoading } = useGetLogsQuery({ limit: 5, offset: 0 });

  const stats = [
    {
      title: t('dashboard.totalSecrets'),
      value: dataItems?.length || 0,
      icon: Key,
      color: "from-blue-500 to-blue-600",
      link: "/dashboard/data",
    },
    {
      title: t('dashboard.totalProjects'),
      value: projects?.length || 0,
      icon: Folder,
      color: "from-emerald-500 to-emerald-600",
      link: "/dashboard/projects",
    },
    {
      title: t('dashboard.activeSecrets'),
      value: dataItems?.filter((s) => s.is_active).length || 0,
      icon: Activity,
      color: "from-green-500 to-green-600",
      link: "/dashboard/data",
    },
    ...(isAdmin
      ? [
          {
            title: t('dashboard.vaultStatus'),
            value: vaultStatus?.vault.sealed ? t('dashboard.sealed') : t('dashboard.unsealed'),
            icon: Lock,
            color: vaultStatus?.vault.sealed ? "from-red-500 to-red-600" : "from-emerald-500 to-emerald-600",
            link: "/dashboard/vault",
          },
        ]
      : []),
  ];

  if (vaultLoading || dataLoading || projectsLoading || auditLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" message={t('dashboard.loading')} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
            {t('dashboard.welcome', { name: user?.name || user?.email })}
          </p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => navigate('/dashboard/create-data')}
                className="btn-primary flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                {t('dashboard.newSecret')}
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="card group hover:scale-[1.02] transition-transform duration-200 cursor-pointer relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-opacity group-hover:opacity-20`} />
            
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500" />
                    {t('dashboard.recentActivity')}
                </h2>
                <Link to="/dashboard/audit" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    {t('dashboard.viewAll')}
                </Link>
            </div>
            
            <div className="card">
                <div className="space-y-4">
                    {auditData?.logs && auditData.logs.length > 0 ? (
                        auditData.logs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${
                                        log.status === 'success' 
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                                            : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                    }`}>
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {log.action}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            by {log.user_id ? log.user_id.slice(0, 8) : t('dashboard.system')} • {log.resource_type}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                    {new Date(log.created_at).toLocaleString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {t('dashboard.noActivity')}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                {t('dashboard.quickActions')}
            </h2>
            
            <div className="grid gap-4">
                <button 
                    onClick={() => navigate('/dashboard/create-data')}
                    className="card hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors text-left group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.addNewSecret')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.storeCredential')}</p>
                        </div>
                    </div>
                </button>

                <button 
                    onClick={() => navigate('/dashboard/projects')}
                    className="card hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors text-left group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <Folder className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.createProject')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.organizeSecrets')}</p>
                        </div>
                    </div>
                </button>

                {isAdmin && (
                    <button 
                        onClick={() => navigate('/dashboard/users')}
                        className="card hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.manageUsers')}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.administerAccess')}</p>
                            </div>
                        </div>
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
