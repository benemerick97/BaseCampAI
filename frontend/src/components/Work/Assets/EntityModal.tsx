// frontend/src/components/Work/Assets/EntityModal.tsx

interface EntityModalProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: Record<string, any>) => void;
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  fields: {
    label: string;
    key: string;
    type?: string;
    options?: { label: string; value: number }[];
  }[];
}

export default function EntityModal({
  title,
  visible,
  onClose,
  onSubmit,
  formData,
  setFormData,
  fields,
}: EntityModalProps) {
  if (!visible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
        <h2 className="text-xl font-semibold mb-4">
          {formData.id ? "Edit" : "Add New"} {title}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ label, key, type = "text", options = [] }) => (
            <div key={key}>
              <label className="block text-sm font-medium">{label}</label>
              {type === "select" ? (
                <select
                  value={formData[key] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: parseInt(e.target.value) })
                  }
                  required
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select...</option>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={formData[key] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {formData.id ? "Update" : "Create"} {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
