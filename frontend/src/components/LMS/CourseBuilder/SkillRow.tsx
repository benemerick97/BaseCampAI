// frontend/src/components/LMS/SkillBuilder/SkillRow.tsx

import React, { useState, useEffect } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { createPortal } from "react-dom";

interface Skill {
  id: string;
  name: string;
  description?: string;
  org_id: number;
  evidence_required: boolean;
  created_at: string;
}

interface SkillRowProps {
  skill: Skill;
  onClick: () => void;
  onEdit: (item: Skill) => void;
  onDelete: (id: string) => void;
  setMainPage: (page: string) => void;
}

const SkillRow: React.FC<SkillRowProps> = ({
  skill,
  onClick,
  onEdit,
  onDelete,
  //setMainPage,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

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
        <button
          onClick={() => {
            setDropdownOpen(false);
            onEdit(skill);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Edit
        </button>
        <button
          onClick={() => {
            setDropdownOpen(false);
            onDelete(skill.id);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          Delete
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
        {skill.name}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
        {skill.description || "—"}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-center text-gray-700">
        {skill.evidence_required ? "Yes" : "No"}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
        {new Date(skill.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-right relative">
        <button onClick={handleDropdownToggle} className="p-1 hover:bg-gray-100 rounded">
          <FiMoreHorizontal size={18} className="text-gray-600 hover:text-gray-800" />
        </button>
        {renderDropdown()}
      </td>
    </>
  );
};

export default SkillRow;
