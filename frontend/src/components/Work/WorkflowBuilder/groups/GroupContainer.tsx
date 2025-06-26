// frontend/src/components/Work/WorkflowBuilder/groups/GroupContainer.tsx

import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useRef, useEffect } from "react";
import { RiDraggable } from "react-icons/ri";
import { FiPlus, FiEdit3, FiMoreHorizontal } from "react-icons/fi";
import { useWorkflowStore } from "../context/useWorkflowStore";
import StepComponent from "../steps/StepCard";
import DropdownPortal from "../ListEditor/DropdownPortal";

interface GroupContainerProps {
  groupId: string;
  className?: string;
  onDeleteGroup?: (id: string) => void;
  onDuplicateGroup?: (id: string) => void;
  onRenameGroup?: (id: string, newLabel: string) => void;
}

export default function GroupContainer({
  groupId,
  className = "",
  onDeleteGroup = (id) => console.log("Delete group", id),
  onDuplicateGroup = (id) => console.log("Duplicate group", id),
  onRenameGroup = (id, name) => console.log("Rename group", id, name),
}: GroupContainerProps) {
  const group = useWorkflowStore((state) => state.groupsById[groupId]);
  const stepIds = group?.stepIds || [];

  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners,
  } = useSortable({ id: groupId });

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(group?.label || "Untitled Section");
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest(".group-dropdown-portal")) {
          setMenuOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 80ms ease",
    willChange: "transform",
    cursor: "default",
  };

  const handleLabelSubmit = () => {
    setIsEditing(false);
    onRenameGroup(groupId, label.trim());
  };

  const handleAddStep = () => {
    const stepCount = stepIds.length + 1;
    useWorkflowStore.getState().addStep({
      id: `step-${crypto.randomUUID()}`,
      label: `Step ${stepCount}`,
      instructions: "",
      inputFields: [],
      groupId,
    });
  };

  return (
    <div ref={setNodeRef} style={dragStyle} className={`relative ${className}`}>
      <div className="bg-white border border-gray-200 shadow rounded-xl p-4 transition-transform duration-100 ease-out">
        {/* Header */}
        <div className="flex items-center mb-4 relative">
          {/* Drag Handle */}
          <div
            {...listeners}
            {...attributes}
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-white text-gray-400 hover:text-gray-600 cursor-grab select-none"
          >
            <RiDraggable size={20} />
          </div>

          {/* Label */}
          <div className="flex-1 flex justify-left">
            {isEditing ? (
              <input
                ref={inputRef}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleLabelSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLabelSubmit();
                }}
                placeholder="Untitled Section"
                className="text-left text-lg font-medium border border-gray-300 rounded px-3 py-1 w-full max-w-xs focus:outline-none focus:ring focus:ring-blue-300"
              />
            ) : (
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setIsEditing(true)}
              >
                <span
                  className={`text-lg font-medium ${
                    label.trim() === "" ? "text-gray-400 italic" : "text-gray-800"
                  }`}
                >
                  {label.trim() || "Untitled Section"}
                </span>
                <FiEdit3 className="text-gray-500 group-hover:text-gray-700" />
              </div>
            )}
          </div>

          {/* Menu Button */}
          <div className="relative ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setMenuPosition({
                  top: rect.bottom + 8,
                  left: rect.right - 180,
                });
                setMenuOpen((prev) => !prev);
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FiMoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Steps (Sortable) */}
        <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {stepIds.map((stepId) => (
              <StepComponent
                key={stepId}
                stepId={stepId}
                isExpanded={expandedStepId === stepId}
                onExpand={() =>
                  setExpandedStepId((prev) => (prev === stepId ? null : stepId))
                }
                onDuplicate={() => {
                  const original = useWorkflowStore.getState().stepsById[stepId];
                  const newStepId = `step-${crypto.randomUUID()}`;
                  useWorkflowStore.getState().addStep({
                    ...original,
                    id: newStepId,
                    label: original.label + " (Copy)",
                  });
                }}
                onDelete={() => {
                  useWorkflowStore.getState().deleteStep(stepId);
                }}
              />
            ))}
          </div>
        </SortableContext>

        {/* ➕ Add Step Button */}
        <div className="pt-4 text-center">
          <button
            onClick={handleAddStep}
            className="px-2 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-full"
            title="Add Step"
          >
            <FiPlus />
          </button>
        </div>
      </div>

      {/* Dropdown Portal */}
      {menuOpen && menuPosition && (
        <DropdownPortal position={menuPosition}>
          <div className="group-dropdown-portal bg-white border border-gray-200 rounded-md shadow-md w-44">
            <button
              onClick={() => {
                setMenuOpen(false);
                onDuplicateGroup(groupId);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Duplicate Group
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onDeleteGroup(groupId);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete Group
            </button>
          </div>
        </DropdownPortal>
      )}
    </div>
  );
}
