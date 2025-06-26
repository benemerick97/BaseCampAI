// components/Work/Builder/utils/reorderHelpers.ts

import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Step, StepGroup } from "../sharedTypes";

interface FlatListItem {
  id: string;
  type: "step" | "group";
}

export function reorderFlatList(
  event: DragEndEvent,
  flatList: FlatListItem[],
  steps: Step[],
  groups: StepGroup[]
): {
  newSteps: Step[];
  newGroups: StepGroup[];
} {
  const { active, over } = event;
  if (!over || active.id === over.id) {
    return { newSteps: steps, newGroups: groups };
  }

  const activeStep = steps.find((s) => `step-${s.id}` === active.id);
  const overStep = steps.find((s) => `step-${s.id}` === over.id);
  const overGroup = groups.find((g) => `group-${g.id}` === over.id);

  if (!activeStep) return { newSteps: steps, newGroups: groups };

  // ✅ Dropped onto a group header
  if (overGroup) {
    return moveStepToGroup(activeStep.id, overGroup.id, steps, groups);
  }

  // ✅ Dropped onto a step in a different group
  if (overStep && activeStep.groupId !== overStep.groupId) {
    return moveStepToGroup(activeStep.id, overStep.groupId, steps, groups);
  }

  // ✅ Reordered within the same group
  if (overStep && activeStep.groupId === overStep.groupId) {
    return reorderStepsWithinGroup(
      activeStep.groupId,
      activeStep.id,
      overStep.id,
      steps,
      groups
    );
  }

  return { newSteps: steps, newGroups: groups };
}

function moveStepToGroup(
  stepId: string,
  targetGroupId: string,
  steps: Step[],
  groups: StepGroup[]
) {
  const updatedSteps = steps.map((step) =>
    step.id === stepId ? { ...step, groupId: targetGroupId } : step
  );
  return { newSteps: updatedSteps, newGroups: groups };
}

function reorderStepsWithinGroup(
  groupId: string,
  activeStepId: string,
  overStepId: string,
  steps: Step[],
  groups: StepGroup[]
) {
  const groupSteps = steps.filter((s) => s.groupId === groupId);
  const oldIndex = groupSteps.findIndex((s) => s.id === activeStepId);
  const newIndex = groupSteps.findIndex((s) => s.id === overStepId);
  const reordered = arrayMove(groupSteps, oldIndex, newIndex);

  const updatedSteps = steps.map((step) => {
    if (step.groupId !== groupId) return step;
    const updated = reordered.shift();
    return updated || step;
  });

  return { newSteps: updatedSteps, newGroups: groups };
}
