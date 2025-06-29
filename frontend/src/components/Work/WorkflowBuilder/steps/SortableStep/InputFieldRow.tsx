import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RiDraggable } from "react-icons/ri";
import { FiToggleLeft, FiToggleRight } from "react-icons/fi";
import type { InputField } from "../../types/InputField";
import InputTextField from "../InputTypes/InputTextField";
import InputDateField from "../InputTypes/InputDateField";
import InputSelectField from "../InputTypes/InputSelectField";
import InputNumberField from "../InputTypes/InputNumberField";
import InputCheckboxField from "../InputTypes/InputCheckboxField";
import InputTextareaField from "../InputTypes/InputTextareaField";

interface InputFieldRowProps {
  id: string;
  index: number;
  field: InputField;
  onUpdate: (updated: Partial<InputField>) => void;
  onRemove: () => void;
}

export default function InputFieldRow({
  id,
  index,
  field,
  onUpdate,
  onRemove,
}: InputFieldRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeComponentMap = {
    text: <InputTextField field={field} onUpdate={onUpdate} />,
    date: <InputDateField field={field} onUpdate={onUpdate} />,
    select: <InputSelectField field={field} onUpdate={onUpdate} />,
    number: <InputNumberField field={field} onUpdate={onUpdate} />,
    checkbox: <InputCheckboxField index={index} field={field} onUpdate={onUpdate} />,
    textarea: <InputTextareaField field={field} onUpdate={onUpdate} />,
  } as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded p-3 space-y-2 bg-white shadow-sm"
    >
      <div className="flex flex-wrap gap-2 items-center">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          <RiDraggable />
        </button>

        {/* Label Input */}
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Field label"
          className="flex-grow min-w-[140px] px-2 py-1 border border-gray-300 rounded text-sm"
        />

        {/* Type Label */}
        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-300">
          {field.type}
        </span>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="text-red-500 text-sm px-2 hover:text-red-700"
          title="Remove field"
        >
          ✕
        </button>
      </div>

      {/* Field-specific controls */}
      {typeComponentMap[field.type]}

      {/* Required Toggle */}
      <div
        className="flex items-center gap-2 text-sm text-gray-700 mt-1 cursor-pointer select-none"
        onClick={() => onUpdate({ required: !field.required })}
      >
        {field.required ? (
          <FiToggleRight className="text-blue-600 w-5 h-5" />
        ) : (
          <FiToggleLeft className="text-gray-400 w-5 h-5" />
        )}
        <span className={field.required ? "text-gray-900" : "text-gray-500"}>
          Required field
        </span>
      </div>
      
    </div>
  );
}
