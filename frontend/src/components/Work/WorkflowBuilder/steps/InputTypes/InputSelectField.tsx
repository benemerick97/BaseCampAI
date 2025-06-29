import type { InputField } from "../../types/InputField";

export default function InputSelectField({
  field,
  onUpdate,
}: {
  field: InputField;
  onUpdate: (update: Partial<InputField>) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">
        Options (comma separated):
      </label>
      <input
        type="text"
        value={field.options?.join(", ") || ""}
        onChange={(e) =>
          onUpdate({
            options: e.target.value.split(",").map((opt) => opt.trim()),
          })
        }
        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
        placeholder="e.g. Option 1, Option 2"
      />
    </div>
  );
}
