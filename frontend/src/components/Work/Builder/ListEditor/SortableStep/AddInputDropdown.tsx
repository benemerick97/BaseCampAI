// components/Work/Builder/SortableStep/AddInputDropdown.tsx

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface AddInputDropdownProps {
  targetRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  visible: boolean;
}

export default function AddInputDropdown({
  targetRef,
  children,
  visible,
}: AddInputDropdownProps) {
  const [style, setStyle] = useState<{ top: number; left: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && visible && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setStyle({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
  }, [isMounted, visible, targetRef]);

  if (!isMounted || !visible || !style || !targetRef.current) return null;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: style.top,
        left: style.left,
        zIndex: 9999,
      }}
      className="bg-white border border-gray-200 rounded shadow-md w-56"
    >
      {children}
    </div>,
    document.body
  );
}
