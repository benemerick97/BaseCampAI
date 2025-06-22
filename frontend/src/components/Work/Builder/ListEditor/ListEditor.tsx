// components/Work/Builder/ListEditor/ListEditor.tsx

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { useWorkflow } from "../WorkflowContext";
import { FiPlus } from "react-icons/fi";

import DraggableContainer from "./DraggableContainer";
import SortableStep from "./SortableStep/SortableStep";
import GroupContainer from "./GroupContainer";
import DragOverlayPreview from "./DragOverlayPreview";

import { useStepHandlers } from "../../../../hooks/useStepHandlers";
import { reorderFlatList } from "../utils/reorderHelpers";

export default function ListEditor() {
  const { steps, setSteps, groups, setGroups } = useWorkflow();

  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [menuOpenStepId, setMenuOpenStepId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));
  const { handleDuplicate, handleDelete, handleAddStep, handleChangeLabel, handleChangeInstructions, handleChangeInputFields } = useStepHandlers(steps, setSteps);

  const flatList = [
    ...groups.map((g) => ({ id: g.id, type: "group" as const })),
    ...steps.filter((s) => !s.groupId).map((s) => ({ id: s.id, type: "step" as const })),
  ];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { newSteps, newGroups } = reorderFlatList(event, flatList, steps, groups);
    setSteps(newSteps);
    setGroups(newGroups);
  };

  const handleExpand = (stepId: string) => {
    setExpandedStepId((prev) => (prev === stepId ? null : stepId));
  };

  const toggleMenu = (stepId: string) => {
    setMenuOpenStepId((prev) => (prev === stepId ? null : stepId));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 max-w-3xl mx-auto px-4">
        <SortableContext
          items={flatList.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {flatList.map((item) => {
            if (item.type === "group") {
              const group = groups.find((g) => g.id === item.id);
              if (!group) return null;

              return (
                <GroupContainer
                  key={group.id}
                  group={group}
                  steps={steps}
                  setGroups={setGroups}
                  setSteps={setSteps}
                  expandedStepId={expandedStepId}
                  handleExpand={handleExpand}
                  handleDuplicate={handleDuplicate}
                  handleDelete={handleDelete}
                  toggleMenu={toggleMenu}
                  menuOpenStepId={menuOpenStepId}
                  onChangeLabel={handleChangeLabel}
                  onChangeInstructions={handleChangeInstructions}
                  onChangeInputFields={handleChangeInputFields}
                />
              );
            }

            const step = steps.find((s) => s.id === item.id);
            if (!step) return null;

            return (
              <DraggableContainer key={step.id} id={step.id}>
                {({ attributes, listeners, isDragging, setNodeRef, transform, transition }) => (
                  <SortableStep
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
                    onChangeLabel={(val) => handleChangeLabel(step.id, val)}
                    onChangeInstructions={(val) => handleChangeInstructions(step.id, val)}
                    onChangeInputFields={(fields) => handleChangeInputFields(step.id, fields)}
                    dragHandleProps={{
                      setNodeRef,
                      transform: transform ?? undefined,
                      transition,
                      isDragging,
                      attributes,
                      listeners,
                    }}
                  />
                )}
              </DraggableContainer>
            );
          })}
        </SortableContext>

        <div className="text-center pt-4">
          <button
            onClick={handleAddStep}
            className="px-2 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <FiPlus />
          </button>
        </div>
      </div>

      <DragOverlayPreview activeId={activeId} steps={steps} groups={groups} />
    </DndContext>
  );
}
