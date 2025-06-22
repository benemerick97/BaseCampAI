// components/Work/Builder/ListEditor/DraggableContainer.tsx

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS, type Transform } from "@dnd-kit/utilities";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface DraggableContainerProps {
  id: string;
  children: (options: {
    attributes: Record<string, any>;
    listeners: SyntheticListenerMap | undefined;
    transform: Transform | null;
    transition: string | undefined;
    isDragging: boolean;
    setNodeRef: (element: HTMLElement | null) => void;
  }) => React.ReactNode;
}

export default function DraggableContainer({ id, children }: DraggableContainerProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div ref={setNodeRef}>
      {children({
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
      })}
    </div>
  );
}
