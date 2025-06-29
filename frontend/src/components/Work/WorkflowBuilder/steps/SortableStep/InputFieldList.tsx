// components/Work/Builder/SortableStep/InputFieldList.tsx

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import InputFieldRow from "./InputFieldRow";
import type { InputField } from "../../types/InputField";

interface InputFieldListProps {
  fields?: InputField[]; // Made optional for safety
  onChange: (fields: InputField[]) => void;
  onUpdateField: (index: number, update: Partial<InputField>) => void;
  onRemoveField: (index: number) => void;
}

export default function InputFieldList({
  fields = [], // Default to empty array
  onChange,
  onUpdateField,
  onRemoveField,
}: InputFieldListProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onChange(arrayMove(fields, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((field) => field.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {fields.map((field, index) => (
            <InputFieldRow
              key={field.id}
              id={field.id}
              index={index}
              field={field}
              onUpdate={(update) => onUpdateField(index, update)}
              onRemove={() => onRemoveField(index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
