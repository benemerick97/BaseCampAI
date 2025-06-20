// components/Work/Builder/utils/updateStepHelpers.ts

import type { Step } from "../sharedTypes";
import type { Node } from "@reactflow/core";

// --- Step-only update helpers (for ListEditor) ---

export function updateStepLabel(
  steps: Step[],
  id: string,
  label: string
): Step[] {
  return steps.map((s) => (s.id === id ? { ...s, label } : s));
}

export function updateStepInstructions(
  steps: Step[],
  id: string,
  instructions: string
): Step[] {
  return steps.map((s) => (s.id === id ? { ...s, instructions } : s));
}

export function updateStepInputFields(
  steps: Step[],
  id: string,
  inputFields: Step["inputFields"]
): Step[] {
  return steps.map((s) => (s.id === id ? { ...s, inputFields } : s));
}

// --- Step + Node update helpers (used in SortableStep) ---

export function updateStep(
  steps: Step[],
  nodes: Node[],
  id: string,
  updates: Partial<Pick<Step, "label" | "instructions" | "inputFields">>
): { updatedSteps: Step[]; updatedNodes: Node[] } {
  const updatedSteps = steps.map((step) =>
    step.id === id
      ? {
          ...step,
          ...updates,
          inputFields: updates.inputFields ?? step.inputFields ?? [],
        }
      : step
  );

  const updatedNodes = nodes.map((node) =>
    node.id === id
      ? {
          ...node,
          data: {
            ...node.data,
            ...updates,
            inputFields: updates.inputFields ?? (node.data?.inputFields ?? []),
          },
        }
      : node
  );

  return { updatedSteps, updatedNodes };
}

export function deleteStep(
  steps: Step[],
  nodes: Node[],
  id: string
): { updatedSteps: Step[]; updatedNodes: Node[] } {
  const updatedSteps = steps.filter((step) => step.id !== id);
  const updatedNodes = nodes.filter((node) => node.id !== id);

  return { updatedSteps, updatedNodes };
}

export function duplicateStep(
  steps: Step[],
  nodes: Node[],
  id: string
): { updatedSteps: Step[]; updatedNodes: Node[] } {
  const original = steps.find((step) => step.id === id);
  if (!original) return { updatedSteps: steps, updatedNodes: nodes };

  const newId = `${id}-copy-${Math.random().toString(36).slice(2, 6)}`;
  const newStep: Step = {
    ...original,
    id: newId,
    label: `${original.label || "Untitled Step"} (copy)`,
    instructions: original.instructions || "",
    inputFields: Array.isArray(original.inputFields)
      ? JSON.parse(JSON.stringify(original.inputFields))
      : [],
  };

  const newNode: Node = {
    id: newId,
    type: "custom",
    data: {
      label: newStep.label,
      instructions: newStep.instructions,
      inputFields: newStep.inputFields,
    },
    position: {
      x: 300,
      y: 100 + nodes.length * 120,
    },
  };

  return {
    updatedSteps: [...steps, newStep],
    updatedNodes: [...nodes, newNode],
  };
}

export function reorderSteps(
  steps: Step[],
  activeId: string,
  overId: string
): Step[] {
  const filtered = steps.filter((s) => s.id !== "start");
  const oldIndex = filtered.findIndex((s) => s.id === activeId);
  const newIndex = filtered.findIndex((s) => s.id === overId);

  if (oldIndex === -1 || newIndex === -1) return steps;

  const reordered = [...filtered];
  const [moved] = reordered.splice(oldIndex, 1);
  reordered.splice(newIndex, 0, moved);

  const startStep = steps.find((s) => s.id === "start");
  return startStep ? [startStep, ...reordered] : reordered;
}
