import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
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
  const [page, setPage] = useState(0);
  const limit = 100; // Fetch more for better stats
  
  const { data, isLoading, error } = useGetLogsQuery({ 
    limit, 
    offset: page * limit 
  });
  
  const user = useSelector((state: RootState) => state.auth.user);

  const stats = useMemo(() => {
    if (!data?.logs) return null;
    
    const logs = data.logs;
    const total = logs.length;
    const success = logs.filter(l => l.status === 'success').length;
    const failure = total - success;
    
    // Action Distribution
    const actionCounts: Record<string, number> = {};
    logs.forEach((l: any) => {
      actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
    });
    const actionData = Object.entries(actionCounts)
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
      const user = l.user_id ? l.user_id.slice(0, 8) : 'System';
      userCounts[user] = (userCounts[user] || 0) + 1;
    });
    const userData = Object.entries(userCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    // Resource Distribution
    const resourceCounts: Record<string, number> = {};
    logs.forEach((l: any) => {
      const type = l.resource_type || 'Unknown';
      resourceCounts[type] = (resourceCounts[type] || 0) + 1;
    });
    const resourceData = Object.entries(resourceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Top IPs
    const ipCounts: Record<string, number> = {};
    logs.forEach((l: any) => {
      const ip = l.ip_address || 'Unknown';
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

    return { total, success, failure, actionData, timelineData, userData, resourceData, ipData, recentFailures };
  }, [data]);

  if (isLoading) return <div className="p-4">Loading audit logs...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to fetch audit logs</div>;

  const logs = data?.logs || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{user?.role === 'admin' ? 'Audit Dashboard' : 'My Activity'}</h1>
        <div className="text-sm text-gray-600">
          Viewing as: {user?.email} ({user?.role})
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm">Total Events</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm">Success Rate</h3>
            <p className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm">Failures</h3>
            <p className="text-2xl font-bold">{stats.failure}</p>
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Timeline */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Activity Timeline (Hourly)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" name="Events" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Distribution */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Action Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.actionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.actionData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row 2 */}
      {stats && (
        <div className={`grid grid-cols-1 ${user?.role === 'admin' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
          {/* Top Users - Admin Only */}
          {user?.role === 'admin' && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Top Users</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.userData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" name="Events" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Resource Distribution */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Resource Types</h3>
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top IPs - Admin Only */}
          {user?.role === 'admin' && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Top IPs</h3>
              <div className="h-64 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">IP</th>
                      <th className="px-4 py-2 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.ipData.map((ip, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-2">{ip.name}</td>
                        <td className="px-4 py-2 text-right font-medium">{ip.value}</td>
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
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Recent Failures</h3>
          <div className="space-y-2">
            {stats.recentFailures.map((log: any) => (
              <div key={log.id} className="flex justify-between items-center bg-white p-2 rounded border border-red-100">
                <div>
                  <span className="font-medium text-red-600">{log.action}</span>
                  <span className="text-gray-500 text-sm ml-2">by {log.user_id ? log.user_id.slice(0, 8) : 'System'}</span>
                  <p className="text-xs text-gray-600">{log.details}</p>
                </div>
                <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Logs Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Detailed Logs</h3>
        </div>
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Time
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className="font-medium">{log.action}</span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {log.resource_type} {log.resource_id ? `(${log.resource_id.slice(0, 8)}...)` : ''}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {log.user_id ? log.user_id.slice(0, 8) : 'System'}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {log.details}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between">
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page + 1}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={logs.length < limit}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AuditDashboard;
