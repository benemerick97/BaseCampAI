// components/Work/Builder/utils/reorderHelpers.ts

import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Step } from "../sharedTypes";

interface FlatListItem {
  id: string;
  type: "step" | "group";
}

export function reorderFlatList(
  event: DragEndEvent,
  flatList: FlatListItem[],
  steps: Step[],
  groups: { id: string; label: string }[]
): {
  newSteps: Step[];
  newGroups: { id: string; label: string }[];
} {
  const { active, over } = event;
  if (!over || active.id === over.id) return { newSteps: steps, newGroups: groups };

  const activeItem = flatList.find((item) => item.id === active.id);
  const overItem = flatList.find((item) => item.id === over.id);

  if (activeItem?.type === "step" && overItem?.type === "group") {
    const updatedSteps = steps.map((step) =>
      step.id === active.id ? { ...step, groupId: String(over.id) } : step
    );
    return { newSteps: updatedSteps, newGroups: groups };
  }

  const oldIndex = flatList.findIndex((item) => item.id === active.id);
  const newIndex = flatList.findIndex((item) => item.id === over.id);
  const reordered = arrayMove(flatList, oldIndex, newIndex);

  const newGroups: typeof groups = [];
  const newSteps: typeof steps = [];

  for (const item of reordered) {
    if (item.type === "group") {
      const group = groups.find((g) => g.id === item.id);
      if (group) newGroups.push(group);
    } else {
      const step = steps.find((s) => s.id === item.id);
      if (step) newSteps.push({ ...step, groupId: undefined });
    }
  }

  const groupedSteps = steps.filter((s) => s.groupId);
  return {
    newGroups,
    newSteps: [...newSteps, ...groupedSteps],
  };
}
