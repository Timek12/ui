import { Plus, X } from "lucide-react";
import React, { useState } from "react";

interface KubernetesFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
  initialData?: {
    name?: string;
    description?: string;
    namespace?: string;
    data?: Array<{ key: string; value: string }>;
  };
}

export const KubernetesForm: React.FC<KubernetesFormProps> = ({
  onSubmit,
  onCancel,
  isEditing = false,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [namespace, setNamespace] = useState(
    initialData?.namespace || "default"
  );
  const [data, setData] = useState<Array<{ key: string; value: string }>>(
    initialData?.data && initialData.data.length > 0
      ? initialData.data
      : [{ key: "", value: "" }]
  );

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setNamespace(initialData.namespace || "default");
      setData(
        initialData.data && initialData.data.length > 0
          ? initialData.data
          : [{ key: "", value: "" }]
      );
    }
  }, [initialData]);

  const addDataField = () => {
    setData([...data, { key: "", value: "" }]);
  };

  const removeDataField = (index: number) => {
    if (data.length > 1) {
      setData(data.filter((_, i) => i !== index));
    }
  };

  const updateDataField = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newData = data.map((d, i) =>
      i === index ? { ...d, [field]: value } : d
    );
    setData(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: "kubernetes",
      name,
      description,
      namespace,
      data: data.filter((d) => d.key && d.value),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Secret Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., my-k8s-config"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Namespace
        </label>
        <input
          type="text"
          value={namespace}
          onChange={(e) => setNamespace(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="default"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Data (Key-Value Pairs) *
        </label>
        <div className="space-y-2">
          {data.map((field, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateDataField(index, "key", e.target.value)}
                placeholder="Key"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) =>
                  updateDataField(index, "value", e.target.value)
                }
                placeholder="Value"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {data.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDataField(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addDataField}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm"
          >
            <Plus size={16} />
            Add Field
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          {isEditing ? "Update Secret" : "Create Secret"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
