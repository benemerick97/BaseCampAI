// hooks/useGroupDrag.ts

import { useCallback, useState } from "react";
import type { StepGroup } from "../../sharedTypes";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

function stripPrefix(id: string | number) {
  return String(id).replace(/^step-/, "").replace(/^group-/, "");
}

export function useGroupDrag(
  groups: StepGroup[],
  setGroups: React.Dispatch<React.SetStateAction<StepGroup[]>>
) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const rawId = stripPrefix(event.active.id);
      const isGroup = groups.some((group) => group.id === rawId);
      if (isGroup) {
        setActiveId(rawId);
      }
    },
    [groups]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent): boolean => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) return true;

      const activeIdStr = stripPrefix(active.id);
      const overIdStr = stripPrefix(over.id);

      const oldIndex = groups.findIndex((g) => g.id === activeIdStr);
      const newIndex = groups.findIndex((g) => g.id === overIdStr);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return true;
      }

      const reorderedGroups = arrayMove(groups, oldIndex, newIndex);
      setGroups(reorderedGroups);
      return true;
    },
    [groups, setGroups]
  );

  return {
    activeId,
    handleDragStart,
    handleDragEnd,
  };
}