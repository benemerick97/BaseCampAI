// components/Work/Builder/ListEditor/ListEditor.tsx

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useWorkflow } from "../WorkflowContext";
import { FiPlus } from "react-icons/fi";

import GroupList from "./SortableGroup/GroupList";
import DragOverlayPreview from "./DragOverlayPreview";

import { useStepManager } from "./hooks/useStepManager";
import { useGroupManager } from "./hooks/useGroupManager";
import { useStepDrag } from "./hooks/useStepDrag";
import { useGroupDrag } from "./hooks/useGroupDrag";

export default function ListEditor() {
  const { steps, setSteps, groups, setGroups } = useWorkflow();

  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [menuOpenStepId, setMenuOpenStepId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const stepHandlers = useStepManager(steps, setSteps);
  const groupHandlers = useGroupManager(groups, setGroups, steps, setSteps);
  const stepDrag = useStepDrag(steps, setSteps, groups, setGroups);
  const groupDrag = useGroupDrag(groups, setGroups);

  const handleDragStart = (event: any) => {
    stepDrag.handleDragStart(event);
    groupDrag.handleDragStart(event);
  };

  const handleDragEnd = (event: any) => {
    if (!stepDrag.handleDragEnd(event)) {
      groupDrag.handleDragEnd(event);
    }
  };

  if (groups.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Click below to add your first group.
        <div className="pt-4">
          <button
            onClick={groupHandlers.handleAddGroup}
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
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={groups.map((g) => `group-${g.id}`)} // ✅ Use prefixed IDs
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6 max-w-3xl mx-auto px-4">
          <GroupList
            groups={groups}
            steps={steps}
            expandedStepId={expandedStepId}
            onExpand={setExpandedStepId}
            menuOpenStepId={menuOpenStepId}
            toggleMenu={setMenuOpenStepId}
            handleDuplicate={stepHandlers.handleDuplicate}
            handleDelete={stepHandlers.handleDelete}
            onChangeLabel={stepHandlers.handleChangeLabel}
            onChangeInstructions={stepHandlers.handleChangeInstructions}
            onChangeInputFields={stepHandlers.handleChangeInputFields}
            onAddStepToGroup={stepHandlers.onAddStepToGroup}
            onDuplicateGroup={groupHandlers.handleDuplicateGroup}
            onDeleteGroup={groupHandlers.handleDeleteGroup}
            onChangeGroupLabel={groupHandlers.onChangeGroupLabel}
          />

          <div className="text-center pt-4">
            <button
              onClick={groupHandlers.handleAddGroup}
              className="px-2 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-full"
            >
              <FiPlus />
            </button>
          </div>
        </div>
      </SortableContext>

      <DragOverlayPreview
        activeId={stepDrag.activeId || groupDrag.activeId}
        steps={steps}
        groups={groups}
      />
    </DndContext>
  );
}
