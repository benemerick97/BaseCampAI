// components/Work/Builder/SortableStep/SortableStep.tsx

import { useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StepHeader from "./StepHeader";
import StepBody from "./StepBody";
import { useWorkflow } from "../../WorkflowContext";
import { updateStep } from "../../utils/updateStepHelpers";
import type { SortableStepShellProps as SortableStepProps } from "../../sharedTypes";
import { stepContainerClass } from "./stepStyles";

function SortableStep({
  id,
  isExpanded,
  onExpand,
  onDuplicate,
  onDelete,
  menuOpen,
  toggleMenu,
}: SortableStepProps) {
  const { steps, nodes, setSteps, setNodes } = useWorkflow();

  const stepId = id.replace(/^step-/, "");
  const currentStep = steps.find((s) => s.id === stepId);

  if (!currentStep) return null;

  const {
    label,
    instructions,
    inputFields = [],
  } = currentStep;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    console.log("🔄 Rendering SortableStep:", { stepId, label });
  }, [stepId, label]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={stepContainerClass(isExpanded, isDragging)}
    >
      <StepHeader
        id={stepId}
        label={label}
        onChangeLabel={(val: string) => {
          const { updatedSteps, updatedNodes } = updateStep(steps, nodes, stepId, { label: val });
          setSteps(updatedSteps);
          setNodes(updatedNodes);
        }}
        onExpand={onExpand}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        isExpanded={isExpanded}
        listeners={listeners}
        attributes={attributes}
      />

      <StepBody
        isExpanded={isExpanded}
        instructions={instructions}
        inputFields={inputFields}
        onChangeInstructions={(val) => {
          const { updatedSteps, updatedNodes } = updateStep(steps, nodes, stepId, {
            instructions: val,
          });
          setSteps(updatedSteps);
          setNodes(updatedNodes);
        }}
        onChangeInputFields={(fields) => {
          const { updatedSteps, updatedNodes } = updateStep(steps, nodes, stepId, {
            inputFields: fields,
          });
          setSteps(updatedSteps);
          setNodes(updatedNodes);
        }}
      />
    </div>
  );
}

export default SortableStep;
