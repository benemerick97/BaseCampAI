// components/Work/Builder/SortableStep/StepHeaderPreview.tsx

import { RiDraggable } from "react-icons/ri";
import { IoIosArrowForward } from "react-icons/io";

interface StepHeaderPreviewProps {
  label: string;
  isGroup?: boolean;
}

export default function StepHeaderPreview({ label, isGroup = false }: StepHeaderPreviewProps) {
  return (
    <div className="flex items-center px-4 py-3 rounded-md bg-white border border-gray-200 shadow-sm w-full max-w-2xl">
      {/* Drag Icon */}
      <div className="flex items-center justify-center mr-2 text-gray-400">
        <RiDraggable size={18} />
      </div>

      {/* Static Expand Icon (forward only for drag preview) */}
      {!isGroup && (
        <div className="mr-2 text-gray-500">
          <IoIosArrowForward size={16} />
        </div>
      )}

      {/* Static Label */}
      <span className="text-sm font-medium text-gray-800 truncate">{label || "Untitled"}</span>
    </div>
  );
}
