import { Shield, Trash2, User as UserIcon } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
    useDeleteUserMutation,
    useGetAllUsersQuery,
    useUpdateUserRoleMutation,
} from "../../services/adminApi";
import { RootState } from "../../store";
import Alert from "../common/Alert";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";

const UsersManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { data: users, isLoading, error } = useGetAllUsersQuery();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRole({
        userId,
        role: { role: newRole as "user" | "admin" },
      }).unwrap();
      setMessage({ type: "success", text: t('admin.userRoleUpdated') });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      let errorText = t('admin.userRoleUpdateError');
      if (err.data?.detail) {
        if (typeof err.data.detail === 'string') {
          errorText = err.data.detail;
        } else if (Array.isArray(err.data.detail)) {
          errorText = err.data.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        } else {
          errorText = JSON.stringify(err.data.detail);
        }
      }
      setMessage({
        type: "error",
        text: errorText,
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser).unwrap();
      setMessage({ type: "success", text: t('admin.userDeleted') });
      setShowDeleteModal(false);
      setSelectedUser(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      let errorText = t('admin.userDeleteError');
      if (err.data?.detail) {
        if (typeof err.data.detail === 'string') {
          errorText = err.data.detail;
        } else if (Array.isArray(err.data.detail)) {
          errorText = err.data.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        } else {
          errorText = JSON.stringify(err.data.detail);
        }
      }
      setMessage({
        type: "error",
        text: errorText,
      });
      setShowDeleteModal(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" message={t('admin.loadingUsers')} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message={t('admin.loadUsersError')} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.userManagement')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {t('admin.manageUserRoles')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Shield className="w-4 h-4" />
          <span>{t('admin.adminOnly')}</span>
        </div>
      </div>

      {message && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('auth.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('projects.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.joined')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50 dark:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name || t('admin.noName')}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {user.user_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.user_id, e.target.value)
                      }
                      disabled={user.user_id === currentUser?.user_id}
                      className={`text-sm font-medium px-3 py-1 rounded-full ${getRoleBadgeColor(
                        user.role
                      )} ${
                        user.user_id === currentUser?.user_id
                          ? "opacity-60 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <option value="user">{t('projects.member')}</option>
                      <option value="admin">{t('projects.admin')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedUser(user.user_id);
                        setShowDeleteModal(true);
                      }}
                      disabled={user.user_id === currentUser?.user_id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        user.user_id === currentUser?.user_id
                          ? t('admin.cannotDeleteSelf')
                          : t('common.delete')
                      }
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users && users.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{t('admin.noUsers')}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        title={t('admin.deleteUserTitle')}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {t('admin.deleteUserConfirm')}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              className="btn-secondary"
            >
              {t('common.cancel')}
            </button>
            <button onClick={handleDeleteUser} className="btn-danger">
              {t('admin.deleteUserButton')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersManagementPage;
