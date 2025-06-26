import React, { useState, useEffect } from "react";

interface EditCustomFieldModalProps {
  isOpen: boolean;
  field: { id: number; name: string; field_type: string };
  initialValue: string;
  onClose: () => void;
  onSave: (fieldId: number, newValue: string) => Promise<void>;
}

export default function EditCustomFieldModal({
  isOpen,
  field,
  initialValue,
  onClose,
  onSave,
}: EditCustomFieldModalProps) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(field.id, value);
      onClose();
    } catch (err) {
      alert("Failed to save custom field value");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit "{field.name}"</h2>
        <input
          type="text"
          className="border w-full px-3 py-2 rounded text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={saving}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
