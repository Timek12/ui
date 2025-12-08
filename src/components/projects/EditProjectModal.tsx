import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateProjectMutation } from '../../services/projectsApi';
import { Project } from '../../types/projects';
import Alert from '../common/Alert';
import Modal from '../common/Modal';

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, project }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [updateProject, { isLoading, error }] = useUpdateProjectMutation();

    useEffect(() => {
        if (project) {
            setName(project.name);
        }
    }, [project]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;

        try {
            await updateProject({ projectId: project.id, name }).unwrap();
            onClose();
        } catch (err) {
            console.error('Failed to update project:', err);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('projects.edit')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <Alert 
                        type="error" 
                        message={
                            'data' in (error as any) 
                                ? (error as any).data.detail 
                                : t('projects.updateError')
                        } 
                    />
                )}
                
                <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('projects.name')}
                    </label>
                    <input
                        type="text"
                        id="edit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-3"
                        placeholder="e.g. Engineering"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('projects.saving') : t('projects.saveChanges')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
