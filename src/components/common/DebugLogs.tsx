import React from "react";

const DebugLogs: React.FC = () => {
  const adminRouteDebug = JSON.parse(
    localStorage.getItem("adminRouteDebug") || "[]"
  );
  const adminRouteRedirect = JSON.parse(
    localStorage.getItem("adminRouteRedirect") || "null"
  );
  const lastApiError = JSON.parse(
    localStorage.getItem("lastApiError") || "null"
  );
  const logoutReason = JSON.parse(
    localStorage.getItem("logoutReason") || "null"
  );
  const authState = localStorage.getItem("auth");

  const clearLogs = () => {
    localStorage.removeItem("adminRouteDebug");
    localStorage.removeItem("adminRouteRedirect");
    localStorage.removeItem("lastApiError");
    localStorage.removeItem("logoutReason");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Debug Logs</h1>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Logs
          </button>
        </div>

        {/* Logout Reason */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            Logout Reason
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(logoutReason, null, 2)}
          </pre>
        </div>

        {/* Last API Error */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">
            Last API Error
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(lastApiError, null, 2)}
          </pre>
        </div>

        {/* Admin Route Redirect */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-600">
            Admin Route Redirect
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(adminRouteRedirect, null, 2)}
          </pre>
        </div>

        {/* Admin Route Debug History */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            Admin Route Debug History (Last 10 Checks)
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(adminRouteDebug, null, 2)}
          </pre>
        </div>

        {/* Auth State */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            Current Auth State (localStorage)
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {authState || "null"}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugLogs;
