import React from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useWorkflow } from "./WorkflowContext";
import { RiDraggable } from "react-icons/ri";
import { FiTrash2 } from "react-icons/fi";

const inputTypes = [
  "text",
  "date",
  "select",
  "number",
  "checkbox",
  "textarea",
] as const;

export default function ListEditor() {
  const { steps, setSteps, nodes, setNodes } = useWorkflow();

  const sensors = useSensors(useSensor(PointerSensor));

  const updateStep = (
    id: string,
    updates: Partial<{ label: string; inputType: string }>
  ) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, ...updates } : step))
    );
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
      )
    );
  };

  const deleteStep = (id: string) => {
    if (id === "start") return;
    setSteps((prev) => prev.filter((step) => step.id !== id));
    setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const filtered = steps.filter((s) => s.id !== "start");
      const oldIndex = filtered.findIndex((s) => s.id === active.id);
      const newIndex = filtered.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(filtered, oldIndex, newIndex);
      const startStep = steps.find((s) => s.id === "start");
      setSteps(startStep ? [startStep, ...reordered] : reordered);
    }
  };

  const visibleSteps = steps.filter((step) => step.id !== "start");

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleSteps.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
          {visibleSteps.map((step) => (
            <SortableStep
              key={step.id}
              id={step.id}
              label={step.label}
              inputType={step.inputType}
              onChangeLabel={(val) => updateStep(step.id, { label: val })}
              onChangeType={(val) => updateStep(step.id, { inputType: val })}
              onDelete={() => deleteStep(step.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableStepProps {
  id: string;
  label: string;
  inputType: string;
  onChangeLabel: (val: string) => void;
  onChangeType: (val: string) => void;
  onDelete: () => void;
}

function SortableStep({
  id,
  label,
  inputType,
  onChangeLabel,
  onChangeType,
  onDelete,
}: SortableStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 transition-all"
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600 pr-3 pl-1 flex items-center"
      >
        <RiDraggable />
      </div>

      {/* Step config content */}
      <div className="flex items-center gap-4 w-full">
        <input
          className="text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 transition w-full sm:w-auto"
          value={label}
          onChange={(e) => onChangeLabel(e.target.value)}
          placeholder="Step label"
        />
        <select
          value={inputType}
          onChange={(e) => onChangeType(e.target.value)}
          className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {inputTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* 🗑 Improved delete button with icon */}
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-white hover:bg-red-500 border border-red-100 ml-auto rounded-full w-7 h-7 flex items-center justify-center transition"
          title="Delete"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
}
