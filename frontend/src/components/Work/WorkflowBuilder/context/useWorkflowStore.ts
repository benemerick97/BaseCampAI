// frontend/src/components/Work/WorkflowBuilder/context/useWorkflowStore.ts

import { create } from "zustand";
import type { WorkflowData, Step, Group } from "../types/index";

interface WorkflowStore extends WorkflowData {
  addGroup: (group: Group) => void;
  addStep: (step: Step) => void;
  moveStep: (stepId: string, toGroupId: string, index?: number) => void;
  reorderGroups: (oldIndex: number, newIndex: number) => void;
  deleteGroup: (groupId: string) => void;
  duplicateGroup: (groupId: string) => void;
  renameGroup: (groupId: string, newLabel: string) => void;
  renameStep: (stepId: string, newLabel: string) => void;
  updateStepInstructions: (stepId: string, newInstructions: string) => void;

  deleteStep: (stepId: string) => void;
  duplicateStep: (stepId: string) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  stepsById: {},
  groupsById: {},
  groupOrder: [],

  addGroup: (group) =>
    set((state) => {
      const prefixedId = `group-${group.id}`;
      const count = state.groupOrder.length + 1;

      return {
        groupsById: {
          ...state.groupsById,
          [prefixedId]: {
            ...group,
            id: prefixedId,
            label: group.label || `Section ${count}`,
          },
        },
        groupOrder: [...state.groupOrder, prefixedId],
      };
    }),

  addStep: (step) =>
    set((state) => {
      const group = state.groupsById[step.groupId];
      return {
        stepsById: { ...state.stepsById, [step.id]: step },
        groupsById: {
          ...state.groupsById,
          [step.groupId]: {
            ...group,
            stepIds: [...group.stepIds, step.id],
          },
        },
      };
    }),

  moveStep: (stepId, toGroupId, index) =>
    set((state) => {
      const step = state.stepsById[stepId];
      const fromGroup = state.groupsById[step.groupId];
      const toGroup = state.groupsById[toGroupId];

      const isSameGroup = step.groupId === toGroupId;

      // Remove from current group
      const filteredStepIds = fromGroup.stepIds.filter((id) => id !== stepId);

      // If index is undefined or out of bounds, default to the end
      const insertIndex =
        typeof index === "number" && index >= 0 && index <= toGroup.stepIds.length
          ? index
          : toGroup.stepIds.length;

      // Insert into correct group
      const newStepIds = [...(isSameGroup ? filteredStepIds : toGroup.stepIds)];
      newStepIds.splice(insertIndex, 0, stepId);

      return {
        stepsById: {
          ...state.stepsById,
          [stepId]: {
            ...step,
            groupId: toGroupId,
          },
        },
        groupsById: {
          ...state.groupsById,
          [fromGroup.id]: {
            ...fromGroup,
            stepIds: isSameGroup ? newStepIds : filteredStepIds,
          },
          [toGroup.id]: {
            ...toGroup,
            stepIds: newStepIds,
          },
        },
      };
    }),


  reorderGroups: (oldIndex, newIndex) =>
    set((state) => {
      const reordered = [...state.groupOrder];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      return { groupOrder: reordered };
    }),

  deleteGroup: (groupId) =>
    set((state) => {
      const { [groupId]: _, ...remainingGroups } = state.groupsById;
      const newGroupOrder = state.groupOrder.filter((id) => id !== groupId);

      const remainingSteps = Object.fromEntries(
        Object.entries(state.stepsById).filter(([_, step]) => step.groupId !== groupId)
      );

      return {
        groupsById: remainingGroups,
        groupOrder: newGroupOrder,
        stepsById: remainingSteps,
      };
    }),

  duplicateGroup: (groupId) =>
    set((state) => {
      const original = state.groupsById[groupId];
      if (!original) return {};

      const newGroupId = `group-${crypto.randomUUID()}`;
      const newStepIds: string[] = [];

      const newSteps = Object.fromEntries(
        Object.entries(state.stepsById)
          .filter(([_, step]) => step.groupId === groupId)
          .map(([_, step]) => {
            const newId = `step-${crypto.randomUUID()}`;
            newStepIds.push(newId);
            return [
              newId,
              {
                ...step,
                id: newId,
                groupId: newGroupId,
              },
            ];
          })
      );

      return {
        groupsById: {
          ...state.groupsById,
          [newGroupId]: {
            id: newGroupId,
            label: original.label + " (Copy)",
            stepIds: newStepIds,
          },
        },
        groupOrder: [...state.groupOrder, newGroupId],
        stepsById: {
          ...state.stepsById,
          ...newSteps,
        },
      };
    }),

  renameGroup: (groupId, newLabel) =>
    set((state) => {
      const group = state.groupsById[groupId];
      if (!group) return {};
      return {
        groupsById: {
          ...state.groupsById,
          [groupId]: {
            ...group,
            label: newLabel,
          },
        },
      };
    }),

  renameStep: (stepId, newLabel) =>
    set((state) => {
      const step = state.stepsById[stepId];
      if (!step) return {};
      return {
        stepsById: {
          ...state.stepsById,
          [stepId]: {
            ...step,
            label: newLabel,
          },
        },
      };
    }),

  updateStepInstructions: (stepId, newInstructions) =>
    set((state) => {
      const step = state.stepsById[stepId];
      if (!step) return {};
      return {
        stepsById: {
          ...state.stepsById,
          [stepId]: {
            ...step,
            instructions: newInstructions,
          },
        },
      };
    }),

    deleteStep: (stepId: string) =>
  set((state) => {
    const step = state.stepsById[stepId];
    if (!step) return {};

    const group = state.groupsById[step.groupId];
    return {
      stepsById: Object.fromEntries(
        Object.entries(state.stepsById).filter(([id]) => id !== stepId)
      ),
      groupsById: {
        ...state.groupsById,
        [group.id]: {
          ...group,
          stepIds: group.stepIds.filter((id) => id !== stepId),
        },
      },
    };
  }),

    duplicateStep: (stepId: string ) =>
    set((state) => {
        const step = state.stepsById[stepId];
        if (!step) return {};

        const newId = `step-${crypto.randomUUID()}`;
        const newStep = {
        ...step,
        id: newId,
        label: `${step.label} (Copy)`,
        };

        return {
        stepsById: {
            ...state.stepsById,
            [newId]: newStep,
        },
        groupsById: {
            ...state.groupsById,
            [step.groupId]: {
            ...state.groupsById[step.groupId],
            stepIds: [...state.groupsById[step.groupId].stepIds, newId],
            },
        },
        };
    }),



}));

