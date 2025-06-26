// frontend/src/components/Work/WorkflowBuilder/steps/StepHeader.tsx

import { useEffect, useRef } from "react";
import { RiDraggable } from "react-icons/ri";
import { FiMoreHorizontal } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface StepHeaderProps {
  id: string;
  label: string;
  isExpanded: boolean;
  menuOpen: boolean;
  listeners?: SyntheticListenerMap;
  attributes?: Record<string, any>;
  onExpand: () => void;
  onChangeLabel: (value: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  toggleMenu: () => void;
}

export default function StepHeader({
  id,
  label,
  isExpanded,
  menuOpen,
  listeners,
  attributes,
  onExpand,
  onChangeLabel,
  onDelete,
  onDuplicate,
  toggleMenu,
}: StepHeaderProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        toggleMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, toggleMenu]);

  return (
    <div className="flex items-center px-4 py-3 rounded-md hover:bg-gray-50 border border-gray-200 transition group relative">
      {/* Drag Handle */}
      <div
        {...listeners}
        {...attributes}
        className="flex items-center justify-center mr-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
        tabIndex={-1}
      >
        <RiDraggable size={18} />
      </div>

      {/* Expand/Collapse Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className="mr-2 text-gray-500 hover:text-gray-700 transition-transform"
        aria-label={isExpanded ? "Collapse step" : "Expand step"}
        aria-controls={`step-body-${id}`}
        aria-expanded={isExpanded}
      >
        {isExpanded ? <IoIosArrowDown size={16} /> : <IoIosArrowForward size={16} />}
      </button>

      {/* Editable Label */}
      <input
        id={`step-label-${id}`}
        className="flex-grow bg-transparent border-b border-transparent group-hover:border-gray-300 focus:border-blue-500 focus:outline-none text-sm font-medium text-gray-800 transition px-1 placeholder-gray-400"
        value={label}
        onChange={(e) => onChangeLabel(e.target.value)}
        placeholder="Enter step title..."
        aria-label="Step label"
      />

      {/* Options Menu */}
      <div className="relative ml-2" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
          className="text-gray-500 hover:text-gray-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label="More options"
        >
          <FiMoreHorizontal size={18} />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-md z-50 w-44"
            role="menu"
          >
            <button
              onClick={onDuplicate}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              role="menuitem"
            >
              Duplicate Step
            </button>
            <button
              onClick={onDelete}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              role="menuitem"
            >
              Delete Step
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
