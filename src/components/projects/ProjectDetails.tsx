import { AlertTriangle, Check, Edit2, Key, Shield, Trash2, UserPlus, X } from 'lucide-react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetDataQuery } from '../../services/dataApi';
import { useAddMemberMutation, useDeleteProjectMutation, useGetMembersQuery, useGetProjectQuery, useRemoveMemberMutation, useUpdateProjectMutation } from '../../services/projectsApi';
import { RootState } from '../../store';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';

interface ProjectDetailsProps {
    projectId: string;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId }) => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: project, isLoading: isLoadingProject } = useGetProjectQuery(projectId);
    const { data: members, isLoading: isLoadingMembers } = useGetMembersQuery(projectId);
    const { data: secrets, isLoading: isLoadingSecrets } = useGetDataQuery({ projectId });
    
    const [addMember, { isLoading: isAddingMember }] = useAddMemberMutation();
    const [removeMember, { isLoading: isRemovingMember }] = useRemoveMemberMutation();
    const [deleteProject, { isLoading: isDeletingProject }] = useDeleteProjectMutation();
    const [updateProject, { isLoading: isUpdatingProject }] = useUpdateProjectMutation();

    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [newMemberId, setNewMemberId] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member');
    const [addMemberError, setAddMemberError] = useState<string | null>(null);

    if (isLoadingProject || isLoadingMembers || isLoadingSecrets) return <LoadingSpinner />;
    if (!project) return <Alert type="error" message="Project not found" />;

    const currentUserMember = members?.find(m => String(m.user_id) === String(user?.user_id));
    const isOwner = String(project.created_by) === String(user?.user_id);
    const isAdmin = currentUserMember?.role === 'admin';
    const canManageMembers = isOwner || isAdmin;

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setAddMemberError(null);
            await addMember({ 
                projectId, 
                data: { user_id: parseInt(newMemberId), role: newMemberRole } 
            }).unwrap();
            setNewMemberId('');
            setNewMemberRole('member');
            setIsAddMemberModalOpen(false);
        } catch (err: any) {
            console.error('Failed to add member:', err);
            setAddMemberError(err.data?.detail || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (userId: number) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                await removeMember({ projectId, userId }).unwrap();
            } catch (err) {
                console.error('Failed to remove member:', err);
            }
        }
    };

    const handleDeleteProject = async () => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone and will delete all project secrets.')) {
            try {
                await deleteProject(projectId).unwrap();
                navigate('/projects');
            } catch (err: any) {
                console.error('Failed to delete project:', err);
                setDeleteError(err.data?.detail || 'Failed to delete project');
            }
        }
    };

    const handleStartEdit = () => {
        setEditedName(project?.name || '');
        setIsEditingName(true);
    };

    const handleSaveEdit = async () => {
        if (!editedName.trim()) return;
        try {
            await updateProject({ projectId, name: editedName }).unwrap();
            setIsEditingName(false);
        } catch (err) {
            console.error('Failed to update project:', err);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingName(false);
        setEditedName('');
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                    {isEditingName ? (
                        <>
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="text-2xl font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                disabled={isUpdatingProject}
                            />
                            <button
                                onClick={handleSaveEdit}
                                disabled={isUpdatingProject || !editedName.trim()}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Check className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={isUpdatingProject}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h2>
                            {isOwner && (
                                <button
                                    onClick={handleStartEdit}
                                    className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                    Created on {new Date(project.created_at).toLocaleDateString()}
                </p>
            </div>

            {deleteError && <Alert type="error" message={deleteError} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Members Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Members
                        </h3>
                        {canManageMembers && (
                            <button
                                onClick={() => {
                                    setAddMemberError(null);
                                    setIsAddMemberModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Member
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {members?.map((member) => (
                            <div key={member.user_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">User ID: {member.user_id}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{member.role}</p>
                                </div>
                                {canManageMembers && member.role !== 'owner' && (
                                    <button
                                        onClick={() => handleRemoveMember(member.user_id)}
                                        disabled={isRemovingMember}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Secrets Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Key className="w-5 h-5" />
                            Project Secrets
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {secrets?.map((secret) => (
                            <div key={secret.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{secret.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{secret.data_type}</p>
                                </div>
                            </div>
                        ))}
                        {secrets?.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                No secrets shared with this project yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            {isOwner && (
                <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30 p-6">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium">Delete this project</p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Once you delete a project, there is no going back. All members will be removed and project secrets will be deleted.
                            </p>
                        </div>
                        <button
                            onClick={handleDeleteProject}
                            disabled={isDeletingProject}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                            {isDeletingProject ? 'Deleting...' : 'Delete Project'}
                        </button>
                    </div>
                </div>
            )}

            <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Add Project Member">
                {addMemberError && <Alert type="error" message={addMemberError} className="mb-4" />}
                <form onSubmit={handleAddMember} className="space-y-4">
                    <div>
                        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            User ID
                        </label>
                        <input
                            type="number"
                            id="userId"
                            value={newMemberId}
                            onChange={(e) => setNewMemberId(e.target.value)}
                            className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                            placeholder="Enter User ID"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Role
                        </label>
                        <select
                            id="role"
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value as 'admin' | 'member')}
                            className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsAddMemberModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isAddingMember}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                        >
                            {isAddingMember ? 'Adding...' : 'Add Member'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
