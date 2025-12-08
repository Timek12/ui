import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateProjectMutation } from '../../services/projectsApi';
import Alert from '../common/Alert';
import Modal from '../common/Modal';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [createProject, { isLoading, error }] = useCreateProjectMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createProject({ name }).unwrap();
            setName('');
            onClose();
        } catch (err) {
            console.error('Failed to create project:', err);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('projects.createTitle')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <Alert 
                        type="error" 
                        message={
                            'data' in (error as any) 
                                ? (error as any).data.detail 
                                : t('projects.createError')
                        } 
                    />
                )}
                
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('projects.name')}
                    </label>
                    <input
                        type="text"
                        id="name"
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
                        {isLoading ? t('projects.creating') : t('projects.create')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
