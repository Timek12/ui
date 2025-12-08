import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';
import { useGetLogsQuery } from '../../services/auditApi';
import { RootState } from '../../store';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AuditDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [tablePage, setTablePage] = useState(0);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0); // 0 = off
  const limit = 100; // Fetch for stats
  const logsPerTablePage = 10; // Display per page
  
  const { data, isLoading, error, refetch } = useGetLogsQuery({ 
    limit, 
    offset: 0 
  });
  
  // Auto-refresh logic
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        refetch();
      }, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, refetch]);
  
  const user = useSelector((state: RootState) => state.auth.user);

  const stats = useMemo(() => {
    if (!data?.logs) return null;
    
    const logs = data.logs;
    const total = logs.length;
    const success = logs.filter(l => l.status === 'success').length;
    const failure = total - success;
    
    // Categorize Actions
    const authActions = ['login', 'logout', 'register', 'token_refresh', 'password_reset'];
    const dataActions = ['create_data', 'update_data', 'delete_data', 'get_data', 'list_data'];
    const projectActions = ['create_project', 'update_project', 'delete_project', 'add_member', 'remove_member', 'list_projects'];
    
    const actionCounts: Record<string, number> = {};
    const authCounts: Record<string, number> = {};
    const dataCounts: Record<string, number> = {};
    const projectCounts: Record<string, number> = {};
    const adminCounts: Record<string, number> = {};
    
    logs.forEach((l: any) => {
      actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
      
      if (authActions.includes(l.action)) {
        authCounts[l.action] = (authCounts[l.action] || 0) + 1;
      } else if (dataActions.includes(l.action)) {
        dataCounts[l.action] = (dataCounts[l.action] || 0) + 1;
      } else if (projectActions.includes(l.action)) {
        projectCounts[l.action] = (projectCounts[l.action] || 0) + 1;
      } else {
        adminCounts[l.action] = (adminCounts[l.action] || 0) + 1;
      }
    });
    
    const authData = Object.entries(authCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const dataData = Object.entries(dataCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const projectData = Object.entries(projectCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const adminData = Object.entries(adminCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Activity Timeline (Group by Hour)
    const timelineCounts: Record<string, number> = {};
    logs.forEach((l: any) => {
      const date = new Date(l.created_at);
      const key = `${date.getHours()}:00`;
      timelineCounts[key] = (timelineCounts[key] || 0) + 1;
    });
    const timelineData = Object.entries(timelineCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));

    // Top Users
    const userCounts: Record<string, number> = {};
    logs.forEach((l: any) => {
      const user = l.user_id ? l.user_id.slice(0, 8) : t('audit.system');
      userCounts[user] = (userCounts[user] || 0) + 1;
    });
    const userData = Object.entries(userCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    // Resource Distribution
    const resourceCounts: Record<string, number> = {};
    logs.forEach((l: any) => {
      const type = l.resource_type || t('audit.unknown');
      resourceCounts[type] = (resourceCounts[type] || 0) + 1;
    });
    const resourceData = Object.entries(resourceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Top IPs
    const ipCounts: Record<string, number> = {};
    logs.forEach((l: any) => {
      const ip = l.ip_address || t('audit.unknown');
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    });
    const ipData = Object.entries(ipCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    // Recent Failures
    const recentFailures = logs
      .filter((l: any) => l.status !== 'success')
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return { total, success, failure, authData, dataData, projectData, adminData, timelineData, userData, resourceData, ipData, recentFailures };
  }, [data, t]);

  if (isLoading) return <div className="p-4">{t('audit.loading')}</div>;
  if (error) return <div className="p-4 text-red-500">{t('audit.loadError')}</div>;

  const logs = data?.logs || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold">{user?.role === 'admin' ? t('audit.dashboardTitle') : t('audit.myActivity')}</h1>
            <div className="text-sm text-gray-600">
            {t('audit.viewingAs')}: {user?.email} ({user?.role})
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{t('audit.autoRefresh')}:</span>
                <select 
                    className="border rounded p-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={autoRefreshInterval}
                    onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                >
                    <option value={0}>{t('audit.off')}</option>
                    <option value={5000}>5s</option>
                    <option value={10000}>10s</option>
                    <option value={30000}>30s</option>
                    <option value={60000}>1m</option>
                </select>
            </div>
            <button 
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('audit.refresh')}
            </button>
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">{t('audit.totalEvents')}</h3>
            <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">{t('audit.successRate')}</h3>
            <p className="text-2xl font-bold dark:text-white">
              {stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}%
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-red-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">{t('audit.failures')}</h3>
            <p className="text-2xl font-bold dark:text-white">{stats.failure}</p>
          </div>
        </div>
      )}

      {/* Charts Row 1 - 3 charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Timeline */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('audit.activityTimeline')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Bar dataKey="value" fill="#8884d8" name={t('audit.events')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Authentication Actions */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('audit.authActions')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.authData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Bar dataKey="value" fill="#0088FE" name={t('audit.count')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Operations */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('audit.dataOperations')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dataData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Bar dataKey="value" fill="#00C49F" name={t('audit.count')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row 2 - 2 charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('audit.projectManagement')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.projectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Bar dataKey="value" fill="#FFBB28" name={t('audit.count')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('audit.adminActions')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.adminData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} style={{ fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Bar dataKey="value" fill="#FF8042" name={t('audit.count')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row 3 - 3 charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resource Distribution */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('audit.resourceTypes')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.resourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.resourceData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Users - Admin Only */}
          {user?.role === 'admin' && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('audit.topUsers')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.userData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="name" type="category" width={80} stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                      itemStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar dataKey="value" fill="#82ca9d" name={t('audit.events')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top IPs - Admin Only */}
          {user?.role === 'admin' && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('audit.topIPs')}</h3>
              <div className="h-64 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-4 py-2 text-left dark:text-gray-300">IP</th>
                      <th className="px-4 py-2 text-right dark:text-gray-300">{t('audit.count')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.ipData.map((ip, idx) => (
                      <tr key={idx} className="border-b dark:border-gray-700">
                        <td className="px-4 py-2 dark:text-gray-300">{ip.name}</td>
                        <td className="px-4 py-2 text-right font-medium dark:text-gray-300">{ip.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Failures */}
      {stats && stats.recentFailures.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg shadow border border-red-200 dark:border-red-900/30">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">{t('audit.recentFailures')}</h3>
          <div className="space-y-2">
            {stats.recentFailures.map((log: any) => (
              <div key={log.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded border border-red-100 dark:border-red-900/20">
                <div>
                  <span className="font-medium text-red-600 dark:text-red-400">{log.action}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">by {log.user_id ? log.user_id.slice(0, 8) : t('audit.system')}</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{log.details}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Logs Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold dark:text-white">{t('audit.detailedLogs')}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('audit.showing')} {tablePage * logsPerTablePage + 1}-{Math.min((tablePage + 1) * logsPerTablePage, logs.length)} {t('audit.of')} {logs.length}
          </span>
        </div>
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {t('audit.time')}
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {t('audit.action')}
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {t('audit.status')}
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {t('audit.resource')}
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {t('audit.user')}
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {t('audit.details')}
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(tablePage * logsPerTablePage, (tablePage + 1) * logsPerTablePage).map((log) => (
              <tr key={log.id}>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm dark:text-gray-300">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm dark:text-gray-300">
                  <span className="font-medium">{log.action}</span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.status === 'success'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm dark:text-gray-300">
                  {log.resource_type} {log.resource_id ? `(${log.resource_id.slice(0, 8)}...)` : ''}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm dark:text-gray-300">
                  {log.user_id ? log.user_id.slice(0, 8) : t('audit.system')}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm dark:text-gray-300">
                  {log.details}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center dark:text-gray-400">
                  {t('audit.noLogs')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Table Pagination - Separate from data fetch pagination */}
        <div className="px-4 py-3 border-t dark:border-gray-700 flex justify-between items-center">
          <button 
            onClick={() => setTablePage(p => Math.max(0, p - 1))}
            disabled={tablePage === 0}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 dark:text-white text-sm"
          >
            {t('audit.previous')}
          </button>
          <span className="text-sm dark:text-white">
            {t('audit.page')} {tablePage + 1} {t('audit.of')} {Math.ceil(logs.length / logsPerTablePage)}
          </span>
          <button 
            onClick={() => setTablePage(p => p + 1)}
            disabled={(tablePage + 1) * logsPerTablePage >= logs.length}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 dark:text-white text-sm"
          >
            {t('audit.next')}
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default AuditDashboard;
