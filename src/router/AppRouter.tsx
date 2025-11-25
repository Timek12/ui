import { Navigate, Route, Routes } from "react-router-dom";
import AdminDataPage from "../components/admin/AdminDataPage";
import UsersManagementPage from "../components/admin/UsersManagementPage";
import AdminRoute from "../components/auth/AdminRoute";
import LoginPage from "../components/auth/LoginPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import RegisterPage from "../components/auth/RegisterPage";
import DebugLogs from "../components/common/DebugLogs";
import DashboardHome from "../components/dashboard/DashboardHome";
import { CreateDataPage } from "../components/data/CreateDataPage";
import DataPage from "../components/data/DataPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import VaultPage from "../components/vault/VaultPage";

export const AppRouter = () => {
  return (
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
        <Route path="data" element={<DataPage />} />
        <Route path="create-data" element={<CreateDataPage />} />
        <Route
          path="all-data"
          element={
            <AdminRoute>
              <AdminDataPage />
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
  );
};
