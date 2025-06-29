import type { InputField } from "../../types/InputField";

export default function InputTextField({
  field,
  onUpdate,
}: {
  field: InputField;
  onUpdate: (update: Partial<InputField>) => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Prefix"
        value={field.prefix || ""}
        onChange={(e) => onUpdate({ prefix: e.target.value })}
        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
      />
      <input
        type="text"
        placeholder="Suffix"
        value={field.suffix || ""}
        onChange={(e) => onUpdate({ suffix: e.target.value })}
        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
      />
    </div>
  );
}
