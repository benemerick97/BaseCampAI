// frontend/src/components/Work/WorkflowBuilder/ListEditor/ListEditor.tsx

import {
  DndContext,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useWorkflowStore } from "../context/useWorkflowStore";
import GroupContainer from "../groups/GroupContainer";
import { useState } from "react";
import { RiDraggable } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";

export default function ListEditor() {
  const groupOrder = useWorkflowStore((s) => s.groupOrder);
  const reorderGroups = useWorkflowStore((s) => s.reorderGroups);
  const moveStep = useWorkflowStore((s) => s.moveStep);
  const getGroup = useWorkflowStore((s) => s.groupsById);
  const addGroup = useWorkflowStore((s) => s.addGroup);

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id.toString();
    if (id.startsWith("group-")) {
      setActiveGroupId(id);
    } else if (id.startsWith("step-")) {
      setActiveStepId(id);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Optional: for preview placeholder
    if (activeId.startsWith("group-") && overId.startsWith("group-")) {
      const activeIndex = groupOrder.indexOf(activeId);
      const overIndex = groupOrder.indexOf(overId);
      const newIndex = activeIndex < overIndex ? overIndex + 1 : overIndex;
      setInsertIndex(newIndex);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveGroupId(null);
    setActiveStepId(null);
    setInsertIndex(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // ✅ Reorder groups
    if (activeId.startsWith("group-") && overId.startsWith("group-")) {
      const oldIndex = groupOrder.indexOf(activeId);
      const newIndex = insertIndex;

      if (
        oldIndex !== -1 &&
        newIndex !== null &&
        oldIndex !== newIndex &&
        oldIndex !== newIndex - 1
      ) {
        reorderGroups(oldIndex, newIndex > oldIndex ? newIndex - 1 : newIndex);
      }
    }

    // ✅ Move step onto another step (within or between groups)
    if (activeId.startsWith("step-") && overId.startsWith("step-")) {
      const state = useWorkflowStore.getState();
      const overStep = state.stepsById[overId];
      if (!overStep) return;

      const targetIndex = state.groupsById[overStep.groupId].stepIds.indexOf(overId);
      moveStep(activeId, overStep.groupId, targetIndex);
    }

    // ✅ Move step onto a group (drop into end of list)
    if (activeId.startsWith("step-") && overId.startsWith("group-")) {
      const state = useWorkflowStore.getState();
      const group = state.groupsById[overId];
      if (!group) return;
      moveStep(activeId, overId, group.stepIds.length);
    }
  };

  if (groupOrder.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Click below to add your first group.
        <div className="pt-4">
          <button
            onClick={() => addGroup({ id: crypto.randomUUID(), label: "", stepIds: [] })}
            className="px-2 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-full"
          >
            <FiPlus />
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={groupOrder} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {groupOrder.map((groupId) => {
            const isOrigin = groupId === activeGroupId;

            return (
              <div key={groupId}>
                <GroupContainer
                  groupId={groupId}
                  className={isOrigin ? "opacity-30 pointer-events-none select-none" : ""}
                  onDeleteGroup={(id) => useWorkflowStore.getState().deleteGroup(id)}
                  onDuplicateGroup={(id) => useWorkflowStore.getState().duplicateGroup(id)}
                  onRenameGroup={(id, name) => useWorkflowStore.getState().renameGroup(id, name)}
                />
              </div>
            );
          })}

          {/* ➕ Add Group Button */}
          <div className="text-center pt-4">
            <button
              onClick={() =>
                useWorkflowStore
                  .getState()
                  .addGroup({ id: crypto.randomUUID(), label: "", stepIds: [] })
              }
              className="px-2 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-full"
            >
              <FiPlus />
            </button>
          </div>
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeGroupId ? (
          <div className="bg-white border border-gray-300 shadow-md rounded-xl p-4 w-full max-w-2xl opacity-90">
            <div className="flex items-center gap-2">
              <RiDraggable className="text-gray-400" />
              <span className="text-md font-medium text-gray-800">
                {getGroup[activeGroupId]?.label || "Dragging Group"}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
