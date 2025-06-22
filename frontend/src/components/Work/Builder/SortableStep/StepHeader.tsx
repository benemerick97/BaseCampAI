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
        toggleMenu();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen, toggleMenu]);

  return (
    <div
      className="flex items-center px-4 py-3 rounded-md hover:bg-gray-50 border border-gray-200 transition group"
      onClick={onExpand}
    >
      {/* Drag Handle (now on the left) */}
      <div
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600 px-2"
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <RiDraggable size={24} />
      </div>

      {/* Expand/Collapse Toggle (moved to the right of drag) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className="mr-2 text-gray-500 hover:text-gray-700 transition-transform"
        aria-label={isExpanded ? "Collapse step" : "Expand step"}
      >
        {isExpanded ? (
          <IoIosArrowDown size={16} />
        ) : (
          <IoIosArrowForward size={16} />
        )}
      </button>

      {/* Editable Label */}
      <input
        className="flex-grow bg-transparent border-b border-transparent group-hover:border-gray-300 focus:border-blue-500 focus:outline-none text-sm font-medium text-gray-800 transition px-1 placeholder-gray-400"
        value={label}
        onChange={(e) => onChangeLabel(e.target.value)}
        placeholder="Enter step title..."
        onClick={(e) => e.stopPropagation()}
        aria-label="Step label"
      />

      {/* Options Menu */}
      <div
        className="relative ml-2"
        onClick={(e) => e.stopPropagation()}
        ref={menuRef}
      >
        <button
          onClick={toggleMenu}
          className="text-gray-500 hover:text-gray-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label="More options"
        >
          <FiMoreHorizontal size={18} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-md z-30 w-44">
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
