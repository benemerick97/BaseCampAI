// components/UI/PortalDropdown.tsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  onClose: () => void;
}

const PortalDropdown = ({ anchorRef, children, onClose }: Props) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 176 + window.scrollX, // 176px = dropdown width
      });
    }
  }, [anchorRef]);

  return createPortal(
    <div
      ref={dropdownRef}
      className="absolute w-44 bg-white border border-gray-200 shadow-lg rounded-md text-sm z-[9999]"
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </div>,
    document.body
  );
};

export default PortalDropdown;
