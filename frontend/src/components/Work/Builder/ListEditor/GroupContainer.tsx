// components/Work/Builder/GroupContainer.tsx

import React, { useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import DroppableGroupContainer from "./DroppableGroupContainer.tsx";
import DraggableContainer from "./DraggableContainer.tsx";
import SortableStep from "./SortableStep/SortableStep";
import { stepContainerClass } from "./SortableStep/stepStyles.ts";
import type { Step, InputField } from "../sharedTypes";
import { RiDraggable } from "react-icons/ri";

interface GroupContainerProps {
  group: { id: string; label: string };
  steps: Step[];
  setGroups: React.Dispatch<React.SetStateAction<{ id: string; label: string }[]>>;
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>;
  expandedStepId: string | null;
  handleExpand: (id: string) => void;
  handleDuplicate: (id: string) => void;
  handleDelete: (id: string) => void;
  toggleMenu: (id: string) => void;
  menuOpenStepId: string | null;
  onChangeLabel: (id: string, value: string) => void;
  onChangeInstructions: (id: string, value: string) => void;
  onChangeInputFields: (id: string, fields: InputField[]) => void;
}

export default function GroupContainer({
  group,
  steps,
  setGroups,
  setSteps,
  expandedStepId,
  handleExpand,
  handleDuplicate,
  handleDelete,
  toggleMenu,
  menuOpenStepId,
  onChangeLabel,
  onChangeInstructions,
  onChangeInputFields,
}: GroupContainerProps) {
  // Local state for editing title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(group.label);

  // Sync localTitle to prop label changes (optional)
  React.useEffect(() => {
    setLocalTitle(group.label);
  }, [group.label]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    // Update group label in parent state
    setGroups((prev) =>
      prev.map((g) => (g.id === group.id ? { ...g, label: localTitle } : g))
    );
  };

  return (
    <DraggableContainer id={group.id}>
      {({ attributes, listeners, isDragging, setNodeRef, transform, transition }) => (
        <DroppableGroupContainer id={group.id}>
          <div
            className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 ${
              isDragging ? "ring-2 ring-blue-300 bg-blue-50" : ""
            }`}
          >
            {/* Group Header */}
            <div className="flex items-center mb-4">
              {/* Drag Handle outside grey container */}
              <div
                {...attributes}
                {...listeners}
                className="mr-3 flex h-2 w-10 items-center justify-center rounded-md bg-white text-gray-400 hover:text-gray-600 cursor-grab select-none"
              >
                <RiDraggable size={20} />
              </div>

              {/* Center: Editable Title */}
              <div className="flex-1 flex justify-left">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    autoFocus
                    className="text-left text-lg font-medium border border-gray-300 rounded px-4 py-1 w-full max-w-xs focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="Enter section title"
                  />
                ) : (
                  <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <span className="text-lg font-medium text-gray-800">{localTitle || "New Section"}</span>
                    <FiEdit3 className="text-gray-500 group-hover:text-gray-700" />
                  </div>
                )}
              </div>
            </div>

            {/* Group Steps */}
            <div className="space-y-4">
              {steps
                .filter((s) => s.groupId === group.id)
                .map((step) => (
                  <SortableStep
                    key={step.id}
                    id={step.id}
                    label={step.label}
                    instructions={step.instructions}
                    inputFields={step.inputFields}
                    isExpanded={expandedStepId === step.id}
                    onExpand={() => handleExpand(step.id)}
                    onDuplicate={() => handleDuplicate(step.id)}
                    onDelete={() => handleDelete(step.id)}
                    menuOpen={menuOpenStepId === step.id}
                    toggleMenu={() => toggleMenu(step.id)}
                    onChangeLabel={(val) => onChangeLabel(step.id, val)}
                    onChangeInstructions={(val) => onChangeInstructions(step.id, val)}
                    onChangeInputFields={(fields) => onChangeInputFields(step.id, fields)}
                    dragHandleProps={{
                      setNodeRef,
                      transform: transform ?? undefined,
                      transition,
                      isDragging,
                      attributes,
                      listeners,
                    }}
                  />
                ))}
            </div>
          </div>
        </DroppableGroupContainer>
      )}
    </DraggableContainer>
  );
}
