import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminSecretsPage from "./components/admin/AdminSecretsPage";
import UsersManagementPage from "./components/admin/UsersManagementPage";
import AdminRoute from "./components/auth/AdminRoute";
import LoginPage from "./components/auth/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RegisterPage from "./components/auth/RegisterPage";
import DebugLogs from "./components/common/DebugLogs";
import DashboardHome from "./components/dashboard/DashboardHome";
import DashboardLayout from "./components/layout/DashboardLayout";
import SecretsPage from "./components/secrets/SecretsPage";
import VaultPage from "./components/vault/VaultPage";
import "./index.css";
import { store } from "./store";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/debug" element={<DebugLogs />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="secrets" element={<SecretsPage />} />
            <Route
              path="all-secrets"
              element={
                <AdminRoute>
                  <AdminSecretsPage />
                </AdminRoute>
              }
            />
            <Route
              path="vault"
              element={
                <AdminRoute>
                  <VaultPage />
                </AdminRoute>
              }
            />
            <Route
              path="users"
              element={
                <AdminRoute>
                  <UsersManagementPage />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
