import React from "react";

interface Field {
  label: string;
  key: string;
  type?: "text" | "select";
  options?: { label: string; value: any }[];
}

interface LearnModalProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: Record<string, any>) => void;
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  fields: Field[];
}

export default function LearnModal({
  title,
  visible,
  onClose,
  onSubmit,
  formData,
  setFormData,
  fields,
}: LearnModalProps) {
  if (!visible) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: string
  ) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md w-full max-w-md shadow-xl relative">
        <h2 className="text-xl font-semibold mb-4">
          {formData?.id ? `Edit ${title}` : `Add ${title}`}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
          className="space-y-4"
        >
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              {field.type === "select" && field.options ? (
                <select
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(e, field.key)}
                  className="border px-3 py-2 rounded w-full text-sm"
                >
                  <option value="">Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(e, field.key)}
                  className="border px-3 py-2 rounded w-full text-sm"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {formData?.id ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
