// components/Work/Builder/SortableStep/InputFieldList.tsx

import type { InputField } from "../sharedTypes";
import InputFieldRow from "./InputFieldRow";

interface InputFieldListProps {
  inputFields: InputField[];
  onChangeInputFields: (fields: InputField[]) => void;
}

export default function InputFieldList({
  inputFields,
  onChangeInputFields,
}: InputFieldListProps) {
  const updateField = (index: number, updated: Partial<InputField>) => {
    if (index < 0 || index >= inputFields.length) {
      console.warn("⚠️ Tried to update non-existent input field at index", index);
      return;
    }
    const updatedFields = [...inputFields];
    updatedFields[index] = { ...updatedFields[index], ...updated };
    onChangeInputFields(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = inputFields.filter((_, i) => i !== index);
    onChangeInputFields(updatedFields);
  };

  return (
    <div className="space-y-3">
      {inputFields.map((field, index) => (
        <InputFieldRow
          key={field.id}
          index={index}
          field={field}
          onUpdate={(updated) => updateField(index, updated)}
          onRemove={() => removeField(index)}
        />
      ))}
    </div>
  );
}
