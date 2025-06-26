// frontend/src/components/Work/WorkflowBuilder/steps/StepCard.tsx

import { useEffect, useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useWorkflowStore } from "../context/useWorkflowStore";
import StepHeader from "./StepHeader";
import StepBody from "./StepBody";

interface StepCardProps {
  stepId: string;
  isExpanded: boolean;
  onExpand: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function StepCard({
  stepId,
  isExpanded,
  onExpand,
  onDuplicate,
  onDelete,
}: StepCardProps) {
  const step = useWorkflowStore((s) => s.stepsById[stepId]);
  const renameStep = useWorkflowStore((s) => s.renameStep);
  const updateInstructions = useWorkflowStore((s) => s.updateStepInstructions);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stepId });

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    console.log("🔄 Rendering StepCard:", { stepId, label: step?.label });
  }, [stepId, step?.label]);

  if (!step) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded border bg-white p-2 shadow transition-colors duration-150 ${
        isExpanded ? "border-blue-500" : "border-gray-300"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <StepHeader
        id={stepId}
        label={step.label}
        onChangeLabel={(val) => renameStep(stepId, val)}
        onExpand={onExpand}
        onDuplicate={() => {
          onDuplicate();
          closeMenu(); // ensure menu closes on action
        }}
        onDelete={() => {
          onDelete();
          closeMenu();
        }}
        isExpanded={isExpanded}
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        listeners={listeners}
        attributes={attributes}
      />

      <StepBody
        isExpanded={isExpanded}
        instructions={step.instructions}
        inputFields={step.inputFields}
        onChangeInstructions={(val) => updateInstructions(stepId, val)}
        onChangeInputFields={(fields) =>
          useWorkflowStore.setState((state) => ({
            stepsById: {
              ...state.stepsById,
              [stepId]: {
                ...state.stepsById[stepId],
                inputFields: fields,
              },
            },
          }))
        }
      />
    </div>
  );
}
