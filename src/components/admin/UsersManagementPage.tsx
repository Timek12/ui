import { Shield, Trash2, User as UserIcon } from "lucide-react";
import React, { useState } from "react";
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
      setMessage({ type: "success", text: "User role updated successfully" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.data?.detail || "Failed to update user role",
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser).unwrap();
      setMessage({ type: "success", text: "User deleted successfully" });
      setShowDeleteModal(false);
      setSelectedUser(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.data?.detail || "Failed to delete user",
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
        <LoadingSpinner size="lg" message="Loading users..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message="Failed to load users. Please try again." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage user roles and permissions
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Shield className="w-4 h-4" />
          <span>Admin Only</span>
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
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
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
                          {user.name || "No name"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {user.user_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                    {user.email_verified ? (
                      <span className="text-xs text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Not verified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{user.provider}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.auth_method}
                    </div>
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
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString("en-GB")}
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
                          ? "Cannot delete your own account"
                          : "Delete user"
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
            <p className="text-gray-500 dark:text-gray-400">No users found</p>
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
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this user? This action cannot be
            undone. All user data and secrets will be permanently removed.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleDeleteUser} className="btn-danger">
              Delete User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersManagementPage;
