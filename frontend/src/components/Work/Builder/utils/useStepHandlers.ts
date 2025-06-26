// components/Work/Builder/hooks/useStepHandlers.ts

import { useCallback } from "react";
import type { Step, InputField } from "../sharedTypes";

export function useStepHandlers(
  steps: Step[],
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>
) {
  const updateStep = useCallback(
    (id: string, update: Partial<Step>) => {
      setSteps((prev) =>
        prev.map((step) => (step.id === id ? { ...step, ...update } : step))
      );
    },
    [setSteps]
  );

  const handleChangeLabel = useCallback(
    (id: string, value: string) => {
      updateStep(id, { label: value });
    },
    [updateStep]
  );

  const handleChangeInstructions = useCallback(
    (id: string, value: string) => {
      updateStep(id, { instructions: value });
    },
    [updateStep]
  );

  const handleChangeInputFields = useCallback(
    (id: string, fields: InputField[]) => {
      updateStep(id, { inputFields: fields });
    },
    [updateStep]
  );

  const handleDuplicate = useCallback(
    (stepId: string) => {
      setSteps((prev) => {
        const stepToDuplicate = prev.find((s) => s.id === stepId);
        if (!stepToDuplicate) return prev;

        const newStep: Step = {
          ...stepToDuplicate,
          id: crypto.randomUUID(),
          label: `${stepToDuplicate.label} (Copy)`,
          groupId: stepToDuplicate.groupId, // ✅ preserve groupId
        };

        return [...prev, newStep];
      });
    },
    [setSteps]
  );

  const handleDelete = useCallback(
    (stepId: string) => {
      setSteps((prev) => prev.filter((s) => s.id !== stepId));
    },
    [setSteps]
  );

  const handleAddStep = useCallback(
    (groupId: string) => {
      const newStep: Step = {
        id: crypto.randomUUID(),
        label: "",
        instructions: "",
        inputFields: [],
        groupId, // ✅ assign correct group
      };

      setSteps((prev) => [...prev, newStep]);
    },
    [setSteps]
  );

  return {
    updateStep,
    handleChangeLabel,
    handleChangeInstructions,
    handleChangeInputFields,
    handleDuplicate,
    handleDelete,
    handleAddStep,
  };
}
