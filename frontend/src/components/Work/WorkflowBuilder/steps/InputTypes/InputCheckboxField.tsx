import type { InputField } from "../../types/InputField";

export default function InputCheckboxField({
  index,
  field,
  onUpdate,
}: {
  index: number;
  field: InputField;
  onUpdate: (update: Partial<InputField>) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
      <label htmlFor={`default-${index}`}>Checked by default?</label>
      <input
        id={`default-${index}`}
        type="checkbox"
        checked={field.default === "true"}
        onChange={(e) => onUpdate({ default: e.target.checked ? "true" : "false" })}
      />
    </div>
  );
}
