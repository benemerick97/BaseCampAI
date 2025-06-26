// components/Work/Builder/ListEditor/DragOverlayPreview.tsx

import { DragOverlay } from "@dnd-kit/core";
import StepHeaderPreview from "./SortableStep/StepHeaderPreview";
import type { Step, StepGroup } from "../sharedTypes";

interface DragOverlayPreviewProps {
  activeId: string | null;
  steps: Step[];
  groups: StepGroup[];
}

function stripPrefix(id: string): string {
  return id.replace(/^step-/, "").replace(/^group-/, "");
}

export default function DragOverlayPreview({ activeId, steps, groups }: DragOverlayPreviewProps) {
  if (!activeId) return null;

  const step = steps.find((s) => `step-${s.id}` === activeId);
  const group = groups.find((g) => `group-${g.id}` === activeId);

  const label = step?.label || group?.label || "Untitled";
  const isGroup = !!group;

  return (
    <DragOverlay>
      <div className="w-full max-w-2xl pointer-events-none opacity-90">
        <StepHeaderPreview label={label} isGroup={isGroup} />
      </div>
    </DragOverlay>
  );
}
