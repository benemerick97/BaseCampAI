// components/Work/Builder/ListEditor/SortableGroup/GroupView.tsx

import React, { useState, useEffect, useRef } from "react";
import { FiEdit3, FiMoreHorizontal, FiPlus } from "react-icons/fi";
import { RiDraggable } from "react-icons/ri";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import DroppableGroupContainer from "../DroppableGroupContainer";
import DraggableContainer from "../DraggableContainer";
import SortableStep from "../SortableStep/SortableStep";
import { stepContainerClass } from "../SortableStep/stepStyles";
import type { Step, InputField, StepGroup } from "../../sharedTypes";

interface GroupViewProps {
  group: StepGroup;
  steps: Step[];
  expandedStepId: string | null;
  handleExpand: (stepId: string) => void;
  handleDuplicate: (stepId: string) => void;
  handleDelete: (stepId: string) => void;
  toggleMenu: (stepId: string) => void;
  menuOpenStepId: string | null;
  onChangeLabel: (stepId: string, value: string) => void;
  onChangeInstructions: (stepId: string, value: string) => void;
  onChangeInputFields: (stepId: string, fields: InputField[]) => void;
  onDuplicateGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddStepToGroup: (groupId: string) => void;
  onChangeGroupLabel: (groupId: string, newLabel: string) => void;
}

export default function GroupView({
  group,
  steps,
  expandedStepId,
  handleExpand,
  handleDuplicate,
  handleDelete,
  toggleMenu,
  menuOpenStepId,
  onChangeLabel,
  onChangeInstructions,
  onChangeInputFields,
  onDuplicateGroup,
  onDeleteGroup,
  onAddStepToGroup,
  onChangeGroupLabel,
}: GroupViewProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(group.label);
  const [groupMenuOpen, setGroupMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalTitle(group.label);
  }, [group.label]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (groupMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setGroupMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [groupMenuOpen]);

  const groupId = group.id.replace(/^group-/, "");

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    onChangeGroupLabel(groupId, localTitle);
  };

  const filteredSteps = steps.filter((s) => s.groupId === groupId);

  return (
    <DraggableContainer id={`group-${groupId}`}>
      {({ attributes, listeners, isDragging, setNodeRef }) => (
        <DroppableGroupContainer id={`group-${groupId}`}>
          <div
            ref={setNodeRef}
            className={`${stepContainerClass(false, isDragging)} rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 ${
              isDragging ? "ring-2 ring-blue-300 bg-blue-50" : ""
            }`}
          >
            {/* Header */}
            <div className="flex items-center mb-4 relative">
              <div
                {...attributes}
                {...listeners}
                className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-white text-gray-400 hover:text-gray-600 cursor-grab select-none"
              >
                <RiDraggable size={20} />
              </div>

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

              <div className="relative ml-2" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroupMenuOpen((prev) => (prev === group.id ? null : group.id));
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <FiMoreHorizontal size={18} />
                </button>

                {groupMenuOpen === group.id && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-md shadow-md z-30 w-44">
                    <button
                      onClick={() => {
                        onDuplicateGroup(groupId);
                        setGroupMenuOpen(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Duplicate Group
                    </button>
                    <button
                      onClick={() => {
                        onDeleteGroup(groupId);
                        setGroupMenuOpen(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete Group
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Steps */}
            <SortableContext items={filteredSteps.map((s) => `step-${s.id}`)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {filteredSteps.map((step) => (
                  <SortableStep
                    key={`step-${step.id}`}
                    id={`step-${step.id}`}
                    isExpanded={expandedStepId === `step-${step.id}`}
                    onExpand={() => handleExpand(`step-${step.id}`)}
                    onDuplicate={() => handleDuplicate(step.id)}
                    onDelete={() => handleDelete(step.id)}
                    menuOpen={menuOpenStepId === `step-${step.id}`}
                    toggleMenu={() => toggleMenu(`step-${step.id}`)}
                    // no label/instructions/inputFields passed anymore!
                  />
                ))}
              </div>
            </SortableContext>

            {/* Add Step */}
            <div className="pt-4 text-center">
              <button
                onClick={() => {
                  console.log("➕ Adding step to group:", groupId);
                  onAddStepToGroup(groupId);
                }}
                className="px-2 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <FiPlus />
              </button>
            </div>
          </div>
        </DroppableGroupContainer>
      )}
    </DraggableContainer>
  );
}