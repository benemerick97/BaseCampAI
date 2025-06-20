// components/Work/Builder/SortableStep/InputFieldRow.tsx

import type { InputField, InputType } from "../sharedTypes";

interface InputFieldRowProps {
  index: number;
  field: InputField;
  onUpdate: (updated: Partial<InputField>) => void;
  onRemove: () => void;
}

const inputTypes: InputType[] = [
  "text",
  "date",
  "select",
  "number",
  "checkbox",
  "textarea",
];

export default function InputFieldRow({
  index,
  field,
  onUpdate,
  onRemove,
}: InputFieldRowProps) {
  return (
    <div className="border rounded p-3 space-y-2 bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Label Input */}
        <input
          type="text"
          aria-label="Field Label"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Field label"
          className="flex-grow min-w-[140px] px-2 py-1 border border-gray-300 rounded text-sm"
        />

        {/* Type Selector */}
        <select
          value={field.type}
          onChange={(e) => onUpdate({ type: e.target.value as InputType })}
          className="text-sm px-2 py-1 border rounded bg-white"
          aria-label="Input Type"
        >
          {inputTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Prefix */}
        <input
          type="text"
          placeholder="Prefix"
          value={field.prefix || ""}
          onChange={(e) => onUpdate({ prefix: e.target.value })}
          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
          aria-label="Prefix"
        />

        {/* Suffix */}
        <input
          type="text"
          placeholder="Suffix"
          value={field.suffix || ""}
          onChange={(e) => onUpdate({ suffix: e.target.value })}
          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
          aria-label="Suffix"
        />

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="text-red-500 text-sm px-2 hover:text-red-700"
          title="Remove field"
          aria-label="Remove field"
        >
          ✕
        </button>
      </div>

      {/* Options for 'select' type */}
      {field.type === "select" && (
        <div>
          <label className="block text-xs text-gray-600 mt-1 mb-1">
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
            placeholder="e.g. Option 1, Option 2, Option 3"
            aria-label="Dropdown Options"
          />
        </div>
      )}
    </div>
  );
}

