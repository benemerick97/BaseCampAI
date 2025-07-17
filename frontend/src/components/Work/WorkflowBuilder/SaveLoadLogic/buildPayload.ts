// frontend/src/components/Work/WorkflowBuilder/buildPayload.ts

import type { GroupPayload, StepPayload, WorkflowPayload, WorkflowStatus } from "./types";

export function buildPayload(
  workflowTitle: string,
  status: WorkflowStatus,
  groupOrder: string[],
  stepsById: Record<string, any>,
  groupsById: Record<string, any>
): WorkflowPayload {
  const groupIdToIndexMap = groupOrder.reduce((map, id, index) => {
    map[id] = index;
    return map;
  }, {} as Record<string, number>);

  const groups: GroupPayload[] = groupOrder.map((id, i) => ({
    name: groupsById[id].label,
    order: i,
  }));

  const steps: StepPayload[] = groupOrder.flatMap((groupId) => {
    const group = groupsById[groupId];
    return group.stepIds.map((stepId: string, stepIndex: number) => {
      const step = stepsById[stepId];
      return {
        title: step.label,
        instructions: step.instructions,
        order: stepIndex,
        group_index: groupIdToIndexMap[groupId],
        inputs: step.inputFields.map((input: any) => ({
          label: input.label,
          input_type: input.type,
          required: input.required ?? false,
          options: input.options?.length ? { values: input.options } : undefined,
        })),
      };
    });
  });

  return {
    name: workflowTitle,
    description: "",
    is_template: false,
    status,
    groups,
    steps,
  };
}
