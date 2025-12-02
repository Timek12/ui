import { Plus, X } from "lucide-react";
import React, { useState } from "react";

interface TextDataFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
  initialData?: {
    name?: string;
    description?: string;
    fields?: Array<{ key: string; value: string }>;
  };
}

export const TextDataForm: React.FC<TextDataFormProps> = ({
  onSubmit,
  onCancel,
  isEditing = false,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [fields, setFields] = useState<Array<{ key: string; value: string }>>(
    initialData?.fields && initialData.fields.length > 0
      ? initialData.fields
      : [{ key: "", value: "" }]
  );

  const addField = () => {
    setFields([...fields, { key: "", value: "" }]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newFields = fields.map((f, i) =>
      i === index ? { ...f, [field]: value } : f
    );
    setFields(newFields);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      type: "text",
      name,
      description,
      fields: fields.filter((f) => f.key && f.value),
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
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="my-data"
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
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Optional description"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Key-Value Pairs *
          </label>
          <button
            type="button"
            onClick={addField}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateField(index, "key", e.target.value)}
                placeholder="Key"
                required
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateField(index, "value", e.target.value)}
                placeholder="Value"
                required
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          {isEditing ? "Update Secret" : "Create Secret"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
