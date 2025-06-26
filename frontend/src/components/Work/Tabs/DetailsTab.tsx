import React, { useState } from "react";
import { useCustomFields } from "../../../hooks/useCustomFields";
import { useCustomFieldValues } from "../../../hooks/useCustomFieldValues";
import EditCustomFieldModal from "../Assets/EditCustomFieldModal";

export default function DetailsTab({ data }: { data: any }) {
  const {
    fields,
    loading: fieldsLoading,
    error: fieldsError,
    createField,
    deleteField,
  } = useCustomFields({
    entityType: "site",
    entityId: data.id,
    organisationId: data.organisation_id,
  });

  const {
    values,
    loading: valuesLoading,
    error: valuesError,
    saveValue,
  } = useCustomFieldValues({ entityId: data.id });

  const [showForm, setShowForm] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedField, setSelectedField] = useState<any | null>(null);

  const handleCreate = async () => {
    if (!fieldName.trim()) return;
    setIsSubmitting(true);
    try {
      await createField({
        name: fieldName.trim(),
        field_type: "text",
        entity_type: "site",
        organisation_id: data.organisation_id,
        is_required: false,
      });
      setFieldName("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create custom field.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldValue = (fieldId: number) => {
    const match = values.find((v) => v.custom_field_id === fieldId);
    return match ? match.value_text : "";
  };

  return (
    <div className="bg-white p-4 rounded-md border shadow-sm space-y-6">
      {/* Core Site Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="text-gray-800 font-medium">{data.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Location</p>
            <p className="text-gray-800 font-medium">{data.location || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="text-gray-800 font-medium">
              {new Date(data.created_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="text-green-600 font-medium">Active</p>
          </div>
        </div>
      </div>

      {/* Custom Fields Section */}
      <div className="pt-4 border-t">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Custom Fields</h3>

        {fieldsLoading || valuesLoading ? (
          <p className="text-sm text-gray-500">Loading custom fields...</p>
        ) : fieldsError || valuesError ? (
          <p className="text-sm text-red-600">
            Error: {fieldsError || valuesError}
          </p>
        ) : fields.length === 0 ? (
          <p className="text-sm text-gray-500">No custom fields added.</p>
        ) : (
          <ul className="space-y-2">
            {fields.map((field) => (
              <li
                key={field.id}
                className="flex flex-col md:flex-row justify-between md:items-center bg-gray-50 border px-3 py-2 rounded text-sm gap-2"
              >
                <div className="flex flex-col">
                  <span className="text-gray-700 font-medium">{field.name}</span>
                  <span className="text-gray-500 text-xs">({field.field_type})</span>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setSelectedField(field)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => deleteField(field.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Add Field Button/Form */}
        <div className="mt-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              + Add Custom Field
            </button>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="Field name"
                  className="border rounded px-3 py-2 text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!fieldName.trim() || isSubmitting}
                  className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {selectedField && (
        <EditCustomFieldModal
          isOpen={true}
          field={selectedField}
          initialValue={getFieldValue(selectedField.id)}
          onClose={() => setSelectedField(null)}
          onSave={saveValue}
        />
      )}
    </div>
  );
}
