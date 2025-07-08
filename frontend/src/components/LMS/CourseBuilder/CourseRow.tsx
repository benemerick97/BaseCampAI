// frontend/src/components/LMS/CourseBuilder/CourseRow.tsx

import React, { useState, useEffect } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { createPortal } from "react-dom";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";

interface Course {
  id: string;
  name: string;
  description?: string;
  org_id: number;
  document_id: string;
  slides: any[];
  created_at: string;
}

interface CourseRowProps {
  course?: Course;
  onClick: () => void;
  onEdit?: (item: Course) => void;
  onDelete?: (id: string) => void;
  setMainPage: (page: string) => void;
  hideAdminActions?: boolean;
  showStatus?: string;
  assignedAt?: string;
  completedAt?: string;
  dueDate?: string;
}

const CourseRow: React.FC<CourseRowProps> = ({
  course,
  onClick,
  onEdit,
  onDelete,
  setMainPage,
  hideAdminActions = false,
  showStatus,
  assignedAt,
  dueDate,
  completedAt,
}) => {
  const { setSelectedEntity } = useSelectedEntity();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  if (!course || !course.id || !course.name) {
    console.warn("⚠️ CourseRow received invalid course object:", course);
    return null;
  }

  const handleDropdownToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownOpen((prev) => !prev);
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  const handleClickOutside = () => setDropdownOpen(false);

  useEffect(() => {
    if (dropdownOpen) {
      window.addEventListener("click", handleClickOutside);
      return () => window.removeEventListener("click", handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleStartCourse = () => {
    setSelectedEntity({ type: "course", id: course.id, data: course });
    setMainPage("courselearn");
  };

  const renderDropdown = () => {
    if (!dropdownOpen || !dropdownPosition) return null;
    const portalRoot = document.getElementById("portal-root");
    if (!portalRoot) return null;

    return createPortal(
      <div
        className="absolute bg-white border border-gray-200 rounded shadow-md z-50 w-32"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left - 128 + 32,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideAdminActions && (
          <>
            <button
              onClick={() => {
                setDropdownOpen(false);
                onEdit?.(course);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Edit
            </button>
            <button
              onClick={() => {
                setDropdownOpen(false);
                onDelete?.(course.id);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Delete
            </button>
          </>
        )}
        <button
          onClick={() => {
            setDropdownOpen(false);
            handleStartCourse();
          }}
          className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
        >
          Start Course
        </button>
      </div>,
      portalRoot
    );
  };

  return (
    <>
      <td
        onClick={onClick}
        className="px-4 py-3 border-r border-gray-100 font-semibold text-gray-900 cursor-pointer"
      >
        {course.name}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
        {course.description || "—"}
      </td>

      {/* Extra columns for admin view */}
      {!hideAdminActions && (
        <>
          <td className="px-4 py-3 border-r border-gray-100 text-gray-700 text-center">
            {course.slides?.length ?? 0}
          </td>
          <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
            {new Date(course.created_at).toLocaleDateString()}
          </td>
        </>
      )}

      {/* User course assignment fields */}
      {hideAdminActions && (
        <>
          <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
            {assignedAt ? new Date(assignedAt).toLocaleDateString() : "—"}
          </td>
          <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
            {dueDate ? new Date(dueDate).toLocaleDateString() : "—"}
          </td>
          <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
            {completedAt ? new Date(completedAt).toLocaleDateString() : "—"}
          </td>
        </>
      )}

      {showStatus !== undefined && (
        <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100">
            {showStatus}
          </span>
        </td>
      )}

      <td className="px-4 py-3 border-r border-gray-100 text-right relative">
        {hideAdminActions ? (
          showStatus === "assigned" ? (
            <button
              onClick={handleStartCourse}
              className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Start Course
            </button>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )
        ) : (
          <>
            <button onClick={handleDropdownToggle} className="p-1 hover:bg-gray-100 rounded">
              <FiMoreHorizontal size={18} className="text-gray-600 hover:text-gray-800" />
            </button>
            {renderDropdown()}
          </>
        )}
      </td>
    </>
  );
};

export default CourseRow;
