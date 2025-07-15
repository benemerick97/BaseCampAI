// frontend/src/components/Work/WorkflowRow.tsx

import React, { useState, useEffect } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { createPortal } from "react-dom";

interface WorkflowItem {
  id: number;
  name: string;
  description?: string;
  is_template: boolean;
  created_at?: string;
  updated_at?: string;
}

interface WorkflowRowProps {
  workflow: WorkflowItem;
  onClick: () => void;
  onEdit: (workflow: WorkflowItem) => void;
  onDelete: (id: number) => void;
  onCreateWorkOrder: (workflow: WorkflowItem) => void;
}

const WorkflowRow: React.FC<WorkflowRowProps> = ({
  workflow,
  onClick,
  onEdit,
  onDelete,
  onCreateWorkOrder,
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
        className="absolute bg-white border border-gray-200 rounded shadow-md z-50 w-48"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left - 192 + 32,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            setDropdownOpen(false);
            onEdit(workflow);
          }}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        >
          Edit Workflow
        </button>
        <button
          onClick={() => {
            setDropdownOpen(false);
            onDelete(workflow.id);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          Delete Workflow
        </button>
        <button
          onClick={() => {
            setDropdownOpen(false);
            onCreateWorkOrder(workflow);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-100"
        >
          Create Work Order
        </button>
      </div>,
      portalRoot
    );
  };

  return (
    <>
      <td
        className="px-4 py-3 border-r border-gray-100 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
        onClick={onClick}
      >
        {workflow.name}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
        {workflow.description || "—"}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-gray-600">
        {workflow.updated_at
          ? new Date(workflow.updated_at).toLocaleDateString()
          : "—"}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-gray-600">
        {workflow.created_at || "—"}
      </td>
      <td
        className="px-4 py-3 border-r border-gray-100 text-right relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleDropdownToggle} className="p-1 hover:bg-gray-100 rounded">
          <FiMoreHorizontal size={18} className="text-gray-600 hover:text-gray-800" />
        </button>
        {renderDropdown()}
      </td>
    </>
  );
};

export default WorkflowRow;
