// components/Work/Builder/SortableStep/SortableStep.tsx

import { useEffect, memo } from "react";
import StepHeader from "./StepHeader";
import StepBody from "./StepBody";
import { useWorkflow } from "../../WorkflowContext";
import { updateStep } from "../../utils/updateStepHelpers";
import type { SortableStepProps } from "../../sharedTypes";
import { stepContainerClass } from "./stepStyles";

function SortableStep({
  id,
  label,
  instructions,
  inputFields,
  isExpanded,
  onExpand,
  onDuplicate,
  onDelete,
  menuOpen,
  toggleMenu,
  dragHandleProps,
}: SortableStepProps) {
  const { steps, nodes, setSteps, setNodes } = useWorkflow();

  const safeInputFields = Array.isArray(inputFields) ? inputFields : [];

  useEffect(() => {
    console.log("🧩 SortableStep rendering:", { id, label, instructions, safeInputFields });
  }, [id, label, instructions, safeInputFields]);

  return (
    <div
      ref={dragHandleProps?.setNodeRef}
      style={{
        transform: dragHandleProps?.transform
          ? `translate3d(${dragHandleProps.transform.x}px, ${dragHandleProps.transform.y}px, 0)`
          : undefined,
        transition: dragHandleProps?.transition,
      }}
      className={stepContainerClass(isExpanded, dragHandleProps?.isDragging)}
    >
      <StepHeader
        id={id}
        label={label}
        onChangeLabel={(val: string) => {
          const { updatedSteps, updatedNodes } = updateStep(steps, nodes, id, { label: val });
          setSteps(updatedSteps);
          setNodes(updatedNodes);
        }}
        onExpand={onExpand}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        isExpanded={isExpanded}
        listeners={dragHandleProps?.listeners}
        attributes={dragHandleProps?.attributes}
      />

      <StepBody
        isExpanded={isExpanded}
        instructions={instructions}
        inputFields={safeInputFields}
        onChangeInstructions={(val) => {
          const { updatedSteps, updatedNodes } = updateStep(steps, nodes, id, {
            instructions: val,
          });
          setSteps(updatedSteps);
          setNodes(updatedNodes);
        }}
        onChangeInputFields={(fields) => {
          const { updatedSteps, updatedNodes } = updateStep(steps, nodes, id, {
            inputFields: fields,
          });
          setSteps(updatedSteps);
          setNodes(updatedNodes);
        }}
      />
    </div>
  );
}

export default memo(SortableStep);
