// frontend/src/components/Work/AssetRow.tsx

import React, { useState, useEffect } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { createPortal } from "react-dom";

interface AssetItem {
  id: number;
  name: string;
  asset_type?: string;
  serial_number?: string;
  created_date: string;
  site_id: number;
  organisation_id: number;
}

interface AssetRowProps {
  asset: AssetItem;
  onClick: () => void;
  onEdit: (item: AssetItem) => void;
  onDelete: (id: number) => void;
}

const AssetRow: React.FC<AssetRowProps> = ({ asset, onClick, onEdit, onDelete }) => {
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
            onEdit(asset);
          }}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        >
          Edit
        </button>
        <button
          onClick={() => {
            setDropdownOpen(false);
            onDelete(asset.id);
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
        className="px-4 py-3 border-r border-gray-100 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
        onClick={onClick}
      >
        {asset.name}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-gray-700">{asset.asset_type || "—"}</td>
      <td className="px-4 py-3 border-r border-gray-100 text-gray-700">{asset.serial_number || "—"}</td>
      <td className="px-4 py-3 border-r border-gray-100 text-gray-600">
        {new Date(asset.created_date).toLocaleDateString()}
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

export default AssetRow;
