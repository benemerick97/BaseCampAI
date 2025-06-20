// components/Work/Builder/SortableStep.tsx

// components/Work/Builder/SortableStep.tsx

import { useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StepHeader from "./StepHeader";
import StepBody from "./StepBody";
import { useWorkflow } from "../WorkflowContext";
import { updateStep } from "../utils/updateStepHelpers";
import type { SortableStepProps } from "../sharedTypes";

export default function SortableStep({
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
}: SortableStepProps) {
  const { steps, nodes, setSteps, setNodes } = useWorkflow();

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const ref = useRef<HTMLDivElement>(null);
  const style = { transform: CSS.Transform.toString(transform), transition };

  const safeInputFields = Array.isArray(inputFields) ? inputFields : [];

  useEffect(() => {
    console.log("🧩 SortableStep rendering with:");
    console.log("   id:", id);
    console.log("   label:", label);
    console.log("   instructions:", instructions);
    console.log("   inputFields:", safeInputFields);
  }, [id, label, instructions, inputFields]);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        ref.current = node;
      }}
      style={style}
      {...attributes}
      className={`flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 transition-all ${
        isExpanded ? "pb-4" : ""
      }`}
    >
      <StepHeader
        label={label}
        onChangeLabel={(val) => {
          const { updatedSteps, updatedNodes } = updateStep(steps, nodes, id, { label: val });
          setSteps(updatedSteps);
          setNodes(updatedNodes);
        }}
        onExpand={onExpand}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        listeners={listeners}
        isExpanded={isExpanded}
      />

      <StepBody
        isExpanded={isExpanded}
        instructions={instructions}
        inputFields={safeInputFields}
        onChangeInstructions={(val) => {
          const { updatedSteps, updatedNodes } = updateStep(steps, nodes, id, { instructions: val });
          setSteps(updatedSteps);
          setNodes(updatedNodes);
        }}
        onChangeInputFields={(fields) => {
          console.log("🔁 Updating inputFields in SortableStep for id:", id, fields);
          const { updatedSteps, updatedNodes } = updateStep(steps, nodes, id, { inputFields: fields });
          setSteps(updatedSteps);
          setNodes(updatedNodes);
        }}
      />
    </div>
  );
}
