// components/Work/Builder/ListEditor.tsx

import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { RiDraggable } from "react-icons/ri";
import { FiTrash2 } from "react-icons/fi";
import { useWorkflow } from "./WorkflowContext";
import SortableStep from "./SortableStep/SortableStep";
import { updateStepLabel, updateStepInstructions, updateStepInputFields } from "./utils/updateStepHelpers";
import type { Step } from "./sharedTypes";

export default function ListEditor() {
  const { steps, setSteps } = useWorkflow();
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [menuOpenStepId, setMenuOpenStepId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleExpand = (stepId: string) => {
    setExpandedStepId((prev) => (prev === stepId ? null : stepId));
  };

  const toggleMenu = (stepId: string) => {
    setMenuOpenStepId((prev) => (prev === stepId ? null : stepId));
  };

  const handleDuplicate = (stepId: string) => {
    const stepToDuplicate = steps.find((step) => step.id === stepId);
    if (!stepToDuplicate) return;
    const newStep: Step = {
      ...stepToDuplicate,
      id: crypto.randomUUID(),
      label: `${stepToDuplicate.label} (Copy)`,
    };
    setSteps([...steps, newStep]);
  };

  const handleDelete = (stepId: string) => {
    setSteps(steps.filter((step) => step.id !== stepId));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = steps.findIndex((step) => step.id === active.id);
      const newIndex = steps.findIndex((step) => step.id === over.id);
      setSteps(arrayMove(steps, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={steps.map((step) => step.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4 max-w-3xl mx-auto px-4">
          {steps
            .filter((step) => step.id !== "start")
            .map((step) => (
              <SortableStep
                key={step.id}
                id={step.id}
                label={step.label}
                instructions={step.instructions}
                inputFields={step.inputFields}
                isExpanded={expandedStepId === step.id}
                onChangeLabel={(val: string) =>
                  setSteps(updateStepLabel(steps, step.id, val))
                }
                onChangeInstructions={(val: string) =>
                  setSteps(updateStepInstructions(steps, step.id, val))
                }
                onChangeInputFields={(fields) =>
                  setSteps(updateStepInputFields(steps, step.id, fields))
                }
                onExpand={() => handleExpand(step.id)}
                onDuplicate={() => handleDuplicate(step.id)}
                onDelete={() => handleDelete(step.id)}
                menuOpen={menuOpenStepId === step.id}
                toggleMenu={() => toggleMenu(step.id)}
              />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
