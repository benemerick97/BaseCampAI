// components/Work/Builder/SortableStep/StepHeader.tsx

import { useEffect, useRef } from "react";
import { RiDraggable } from "react-icons/ri";
import { FiMoreHorizontal } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import type { SortableStepProps } from "../sharedTypes";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface StepHeaderProps extends Pick<
  SortableStepProps,
  | "label"
  | "onChangeLabel"
  | "onExpand"
  | "onDuplicate"
  | "onDelete"
  | "menuOpen"
  | "toggleMenu"
> {
  listeners: SyntheticListenerMap | undefined;
  isExpanded: boolean;
}

export default function StepHeader({
  label,
  onChangeLabel,
  onExpand,
  onDuplicate,
  onDelete,
  menuOpen,
  toggleMenu,
  listeners,
  isExpanded,
}: StepHeaderProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        toggleMenu(); // close menu if open and click is outside
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen, toggleMenu]);

  return (
    <div className="flex items-center px-4 py-3">
      {/* Expand/Collapse Toggle */}
      <button
        onClick={onExpand}
        className="mr-2 text-gray-500 hover:text-gray-700"
        title={isExpanded ? "Collapse" : "Expand"}
      >
        {isExpanded ? <IoIosArrowDown size={16} /> : <IoIosArrowForward size={16} />}
      </button>

      {/* Drag Handle */}
      <div
        {...listeners}
        className="drag-handle cursor-grab text-gray-400 hover:text-gray-600 pr-3 pl-1 flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <RiDraggable size={20} />
      </div>

      {/* Editable Label */}
      <input
        className="text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 transition w-full sm:w-auto placeholder-gray-400"
        value={label}
        onChange={(e) => onChangeLabel(e.target.value)}
        placeholder="Enter the next step"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Options Menu */}
      <div
        className="relative ml-auto"
        onClick={(e) => e.stopPropagation()}
        ref={menuRef}
      >
        <button
          onClick={toggleMenu}
          className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
          title="Options"
        >
          <FiMoreHorizontal size={18} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow z-20 w-40">
            <button
              onClick={() => {
                onDuplicate();
                toggleMenu();
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Duplicate Step
            </button>
            <button
              onClick={() => {
                onDelete();
                toggleMenu();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete Step
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
