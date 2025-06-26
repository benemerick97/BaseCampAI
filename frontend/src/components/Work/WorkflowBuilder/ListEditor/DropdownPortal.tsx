// frontend/src/components/Work/WorkflowBuilder/ListEditor/DropdownPortal.tsx

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownPortalProps {
  children: React.ReactNode;
  position: { top: number; left: number };
}

export default function DropdownPortal({ children, position }: DropdownPortalProps) {
  const [container] = useState(() => document.createElement("div"));

  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  return createPortal(
    <div
      className="absolute z-[1000]"
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </div>,
    container
  );
}