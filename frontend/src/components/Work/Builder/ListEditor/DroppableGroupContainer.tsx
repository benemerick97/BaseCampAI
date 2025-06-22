// components/Work/Builder/DroppableGroupContainer.tsx

import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableGroupContainerProps {
  id: string; // This should be the group id
  children: React.ReactNode;
}

export default function DroppableGroupContainer({ id, children }: DroppableGroupContainerProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      data-group-id={id}
      className={`transition-all ${isOver ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
    >
      {children}
    </div>
  );
}