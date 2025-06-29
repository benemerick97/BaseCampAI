import type { InputField } from "../../types/InputField";

export default function InputTextareaField({
  field: _field,
  onUpdate: _onUpdate,
}: {
  field: InputField;
  onUpdate: (update: Partial<InputField>) => void;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-500 mb-1">Multiline input</label>
      <textarea
        rows={3}
        disabled
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100 text-gray-600"
        placeholder="User input will appear here"
      />
    </div>
  );
}
