import {
  Box,
  Check,
  Copy,
  Cpu,
  Edit2,
  FileText,
  Folder,
  Key,
  Plus,
  RefreshCw,
  Shield,
  Terminal,
  Trash2,
  UserCircle
} from "lucide-react";

import { skipToken } from "@reduxjs/toolkit/query/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useDeleteDataMutation,
  useGetDataByIdQuery,
  useGetDataQuery,
  useRotateDataMutation,
  useUpdateDataMutation
} from "../../services/dataApi";
import { useListProjectsQuery } from "../../services/projectsApi";
import type { DataListItem, DataUpdate } from "../../types/data.types";
import Alert from "../common/Alert";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";
import { ApiKeyForm } from "./forms/ApiKeyForm";
import { CertificateForm } from "./forms/CertificateForm";
import { CredentialsForm } from "./forms/CredentialsForm";
import { KubernetesForm } from "./forms/KubernetesForm";
import { SshKeyForm } from "./forms/SshKeyForm";
import { TextDataForm } from "./forms/TextDataForm";

const DataPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<DataListItem | null>(null);
  const [editingDataId, setEditingDataId] = useState<string | null>(null);
  const [editProjectId, setEditProjectId] = useState<string>("");
  const [editRotationInterval, setEditRotationInterval] = useState<number>(0);

  // Rotation Confirmation Modal State
  const [isRotateConfirmOpen, setIsRotateConfirmOpen] = useState(false);

  // Safely close modals on mount/unmount
  useEffect(() => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsRotateConfirmOpen(false);
    // Cleanup body style if stuck
    document.body.style.overflow = 'unset';
    
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, []);


  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState<{ id: string; name: string } | null>(null);

  const { user } = useSelector((state: any) => state.auth);
  const { data: projects } = useListProjectsQuery();
  
  const { data: dataList, isLoading, error: fetchError } = useGetDataQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { refetchOnMountOrArgChange: true }
  );

  const [updateData] = useUpdateDataMutation();
  const [deleteData] = useDeleteDataMutation();
  const [rotateData] = useRotateDataMutation();
  
  const { data: fullData, isLoading: isLoadingFullData, refetch } = useGetDataByIdQuery(
    editingDataId ? { id: editingDataId, projectId: selectedProjectId || undefined } : skipToken,
    { skip: !editingDataId, refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (editingDataId) {
        refetch();
    }
  }, [editingDataId, refetch]);
  
  // Sync rotation interval when full data loads
  useEffect(() => {
    if (fullData) {
        setEditRotationInterval(fullData.rotation_interval_days || 0);
    }
  }, [fullData]);

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; Icon: any; className: string }> = {
        text: {
            label: t('types.text'),
            Icon: FileText,
            className: "bg-blue-100 text-blue-800 border-blue-200",
        },
        kubernetes: {
            label: t('types.kubernetes'),
            Icon: Box,
            className: "bg-indigo-100 text-indigo-800 border-indigo-200",
        },
        credentials: {
            label: t('types.credentials'),
            Icon: UserCircle,
            className: "bg-green-100 text-green-800 border-green-200",
        },
        api_key: {
            label: t('types.apiKey'),
            Icon: Cpu,
            className: "bg-emerald-100 text-emerald-800 border-emerald-200",
        },
        ssh_key: {
            label: t('types.sshKey'),
            Icon: Terminal,
            className: "bg-orange-100 text-orange-800 border-orange-200",
        },
        certificate: {
            label: t('types.certificate'),
            Icon: Shield,
            className: "bg-red-100 text-red-800 border-red-200",
        },
    };

    const badge = badges[type] || {
      label: type,
      Icon: FileText,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    };
    const { Icon, label, className } = badge;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  const handleEditData = (data: DataListItem) => {
    setEditingData(data);
    setEditingDataId(data.id);
    setEditProjectId(selectedProjectId);
    setEditRotationInterval(data.rotation_interval_days || 0);
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingData(null);
    setEditingDataId(null);
    setError(null);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDataToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!dataToDelete) return;
    
    try {
      await deleteData(dataToDelete.id).unwrap();
      setSuccess(t('secrets.deleteSuccess', { name: dataToDelete.name }));
      setIsDeleteModalOpen(false);
      setDataToDelete(null);
    } catch (err: any) {
      if (err?.status === 403) {
        setError(t('secrets.deletePermissionError'));
      } else {
        setError(err?.data?.detail || t('secrets.deleteError'));
      }
      setIsDeleteModalOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDataToDelete(null);
  };

  const handleUpdateSubmit = async (formData: any) => {
    if (!editingData || !editingDataId) return;

    setError(null);
    setSuccess(null);

    try {
      const updatePayload: DataUpdate = {
        name: formData.name,
        description: formData.description,
        project_id: editProjectId || undefined,
        rotation_interval_days: editRotationInterval,
      };

      switch (editingData.data_type) {
        case "text":
          updatePayload.fields = formData.fields;
          break;
        case "kubernetes":
          updatePayload.namespace = formData.namespace;
          updatePayload.data = formData.data;
          break;
        case "credentials":
          updatePayload.username = formData.username;
          updatePayload.password = formData.password;
          updatePayload.url = formData.url;
          break;
        case "api_key":
          updatePayload.apiKey = formData.apiKey;
          break;
        case "ssh_key":
          updatePayload.privateKey = formData.privateKey;
          updatePayload.publicKey = formData.publicKey;
          updatePayload.passphrase = formData.passphrase;
          updatePayload.host = formData.host;
          updatePayload.username = formData.username;
          break;
        case "certificate":
          updatePayload.certificate = formData.certificate;
          updatePayload.privateKey = formData.privateKey;
          updatePayload.passphrase = formData.passphrase;
          updatePayload.chain = formData.chain;
          break;
      }

      await updateData({
        id: editingDataId,
        data: updatePayload,
      }).unwrap();

      setSuccess(t('secrets.updateSuccess'));
      setIsEditModalOpen(false);
      setEditingData(null);
      setEditingDataId(null);
    } catch (err: any) {
      const errorDetail = err?.data?.detail;
      setError(errorDetail || t('secrets.updateError'));
      
      // If vault is sealed, close the modal so the error is visible on the dashboard
      if (errorDetail === "Vault is sealed. Cannot update data value." ||
          errorDetail === "No master key available. Vault may need to be unsealed." ||
          err?.status === 503) {
          setIsEditModalOpen(false);
          setEditingData(null);
          setEditingDataId(null);
      }
    }
  };

  const handleManualRotate = async () => {
    if (!editingDataId) return;
    try {
        await rotateData(editingDataId).unwrap();
        setSuccess(t('secrets.rotationSuccess', 'Secret rotated successfully!'));
        refetch(); // Refresh data to show new version
        setIsEditModalOpen(false);
        setIsRotateConfirmOpen(false);
    } catch (err: any) {
        const errorDetail = err?.data?.detail;
        setError(errorDetail || t('secrets.rotationError', 'Failed to rotate secret'));
        
        // If vault is sealed, close the modal
        if (errorDetail === "Vault is sealed. Please unseal the vault first." ||
            errorDetail === "No master key available. Vault may need to be unsealed." ||
            err?.status === 503) {
            setIsEditModalOpen(false);
            setEditingData(null);
            setEditingDataId(null);
        }
        setIsRotateConfirmOpen(false);
    }
  };

  const renderEditForm = () => {
    if (!editingData || !fullData) return null;

    const decrypted = fullData.decrypted_data || {};
    const metadata = fullData.metadata || {};

    const initialData = {
      type: editingData.data_type,
      name: editingData.name,
      description: editingData.description,
    };

    const formProps = {
        key: editingData.id,
        onSubmit: handleUpdateSubmit,
        onCancel: handleCancelEdit,
        isEditing: true,
    };

    let formContent = null;

    switch (editingData.data_type) {
      case "text":
        formContent = (
          <TextDataForm
            {...formProps}
            initialData={{
              ...initialData,
              fields: decrypted.fields || [],
            }}
          />
        );
        break;
      case "kubernetes":
        formContent = (
          <KubernetesForm
            {...formProps}
            initialData={{
              ...initialData,
              namespace: metadata.namespace || "",
              data: decrypted.data || [],
            }}
          />
        );
        break;
      case "credentials":
        formContent = (
          <CredentialsForm
            {...formProps}
            initialData={{
              ...initialData,
              username: metadata.username || "",
              password: decrypted.password || "",
              url: metadata.url || "",
            }}
          />
        );
        break;
      case "api_key":
        formContent = (
          <ApiKeyForm
            {...formProps}
            initialData={{
              ...initialData,
              apiKey: decrypted.apiKey || "",
            }}
          />
        );
        break;
      case "ssh_key":
        formContent = (
          <SshKeyForm
            {...formProps}
            initialData={{
              ...initialData,
              privateKey: decrypted.privateKey || "",
              publicKey: decrypted.publicKey || "",
              passphrase: decrypted.passphrase || "",
              host: metadata.host || "",
              username: metadata.username || "",
            }}
          />
        );
        break;
      case "certificate":
        formContent = (
          <CertificateForm
            {...formProps}
            initialData={{
              ...initialData,
              certificate: decrypted.certificate || "",
              privateKey: decrypted.privateKey || "",
              passphrase: decrypted.passphrase || "",
              chain: decrypted.chain || "",
            }}
          />
        );
        break;
      default:
        return null;
    }

    return (
        <div className="space-y-6">
             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 {t('secrets.projectAssignment')}
               </label>
               <select
                 value={editProjectId}
                 onChange={(e) => setEditProjectId(e.target.value)}
                 disabled={!fullData || !user || String(user.user_id) !== String(fullData.user_id)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <option value="">{t('secrets.personalOption')}</option>
                 {projects?.map((project) => (
                   <option key={project.id} value={project.id}>
                     {project.name}
                   </option>
                 ))}
               </select>
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                 {user && fullData && String(user.user_id) === String(fullData.user_id)
                   ? t('secrets.ownerChange')
                   : t('secrets.notOwnerChange')}
               </p>
             </div>

             {/* Rotation Policy */}
             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        {t('secrets.rotationPolicy', 'Rotation Policy')}
                    </h4>
                    {(editingData.data_type === "credentials" || editingData.data_type === "api_key") && (
                        <button
                            type="button"
                            onClick={() => setIsRotateConfirmOpen(true)}
                            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" />
                            {t('secrets.rotateNow', 'Rotate Now')}
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('secrets.rotationInterval', 'Rotation Interval (Days)')}
                         </label>
                         <input
                            type="number"
                            min="0"
                            placeholder="0 (Disabled)"
                            value={editRotationInterval}
                            onChange={(e) => setEditRotationInterval(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                         />
                         <p className="text-xs text-gray-500 mt-1">
                            {t('secrets.rotationHelp', 'Set to 0 to disable automatic rotation reminders.')}
                         </p>
                    </div>
                    {fullData.next_rotation_date && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('secrets.nextRotation', 'Next Rotation Due')}
                            </label>
                            <div className="px-3 py-2 bg-white dark:bg-gray-600 rounded-md border border-gray-200 dark:border-gray-500 text-sm">
                                {new Date(fullData.next_rotation_date).toLocaleDateString("pl-PL")}
                            </div>
                        </div>
                    )}
                </div>
             </div>
            {formContent}
        </div>
    );
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      setError(t('secrets.copyError'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" message={t('secrets.loading')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('secrets.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('secrets.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative">
                <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
                >
                    <option value="">{t('secrets.personal')}</option>
                    {projects?.map((project) => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                    ))}
                </select>
                <Folder className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            <button
            onClick={() => navigate(selectedProjectId ? `/dashboard/create-data?projectId=${selectedProjectId}` : "/dashboard/create-data")}
            className="btn-primary flex items-center gap-2"
            >
            <Plus className="w-5 h-5" />
            {t('secrets.new')}
            </button>
        </div>
      </div>

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {fetchError && (
        <Alert
          type="error"
          message={`Failed to load secrets: ${JSON.stringify(fetchError)}`}
          onClose={() => {}}
        />
      )}

      {/* Data List */}
      {dataList && dataList.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {dataList.map((data) => (
            <div key={data.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Key className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {data.name}
                    </h3>
                    {getTypeBadge(data.data_type)}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 font-mono">
                      {t('secrets.id')}: {data.id}
                    </span>
                    <button
                      onClick={() => copyToClipboard(data.id, `id-${data.id}`)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title={t('common.copy')}
                    >
                      {copiedId === `id-${data.id}` ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                    {data.description || t('secrets.noDescription', 'No description')}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>{t('secrets.version')}: {data.version ?? "N/A"}</span>
                    <span>•</span>
                    <span>
                      {t('secrets.created')}:{" "}
                      {new Date(data.created_at).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditData(data)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t('common.edit')}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(data.id, data.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('secrets.noSecrets')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('secrets.getStarted')}
          </p>
          <button
            onClick={() => navigate("/dashboard/create-data")}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('secrets.createButton')}
          </button>
        </div>
      )}

      {/* Edit Secret Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title={`${t('secrets.editTitle')} - ${editingData?.data_type || ""}`}
        size="lg"
      >
        {fullData?.decrypt_error && (
            <Alert type="error" message={`${t('secrets.decryptError', 'Decryption error')}: ${fullData.decrypt_error}`} />
        )}
        {isLoadingFullData ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="md" message={t('secrets.loadingData')} />
          </div>
        ) : editingData ? (
          renderEditForm()
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t('secrets.noData')}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title={t('secrets.deleteTitle', 'Delete Secret')}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {t('secrets.deleteConfirm', { name: dataToDelete?.name })}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancelDelete}
              className="btn-secondary"
            >
              {t('common.cancel')}
            </button>
            <button onClick={handleConfirmDelete} className="btn-danger">
              {t('common.delete')}
            </button>
          </div>
        </div>
      </Modal>
      {/* Rotation Confirmation Modal */}
      <Modal
        isOpen={isRotateConfirmOpen}
        onClose={() => setIsRotateConfirmOpen(false)}
        title={t('secrets.rotateConfirmTitle')}
        size="sm"
      >
        <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
                {t('secrets.rotateConfirmMessage')}
            </p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => setIsRotateConfirmOpen(false)}
                    className="btn-secondary"
                >
                    {t('common.cancel')}
                </button>
                <button
                    onClick={handleManualRotate}
                    className="btn-primary"
                >
                    {t('secrets.confirmRotate')}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default DataPage;
