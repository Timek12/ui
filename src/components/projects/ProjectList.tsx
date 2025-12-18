import { Check, ChevronRight, Copy, Folder, Pencil, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useListProjectsQuery } from '../../services/projectsApi';
import { Project } from '../../types/projects';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';
import { CreateProjectModal } from './CreateProjectModal';
import { EditProjectModal } from './EditProjectModal';
import { ProjectDetails } from './ProjectDetails';

export const ProjectList: React.FC = () => {
    const { t } = useTranslation();
    const { data: projects, isLoading, error } = useListProjectsQuery();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopyId = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <Alert type="error" message={t('projects.loadError')} />;

    if (selectedProjectId) {
        return (
            <div>
                <button 
                    onClick={() => setSelectedProjectId(null)}
                    className="mb-4 text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                    &larr; {t('projects.back')}
                </button>
                <ProjectDetails projectId={selectedProjectId} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('projects.title')}</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {t('projects.create')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects?.map((project) => (
                    <div 
                        key={project.id} 
                        className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer relative"
                        onClick={() => setSelectedProjectId(project.id)}
                    >
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingProject(project);
                                }}
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                title={t('projects.edit')}
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                                <Folder className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 pr-8">{project.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="text-xs font-mono text-gray-500 dark:text-gray-400 select-all" onClick={(e) => e.stopPropagation()}>
                                 ID: {project.id}
                             </span>
                             <button
                                onClick={(e) => handleCopyId(e, project.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title={t('common.copy')}
                            >
                                {copiedId === project.id ? (
                                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                ) : (
                                    <Copy className="w-3 h-3" />
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('projects.created')} {new Date(project.created_at).toLocaleDateString("pl-PL")}
                        </p>
                    </div>
                ))}
                
                {projects?.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('projects.noProjects')}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{t('projects.createFirst')}</p>
                    </div>
                )}
            </div>

            <CreateProjectModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
            />

            <EditProjectModal
                isOpen={!!editingProject}
                onClose={() => setEditingProject(null)}
                project={editingProject}
            />
        </div>
    );
};
