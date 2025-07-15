// frontend/src/components/LMS/LearnListPage.tsx

import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";

export interface LearnListPageProps<T> {
  title: string;
  entityType: string;
  items: T[];
  onFetch: () => Promise<void>;
  onSelect: (id: string | number) => void;
  renderRow: (
    item: T,
    openDropdown: string | number | null,
    setDropdownOpen: (id: string | number | null) => void,
    openEditModal: (item: T) => void
  ) => React.ReactNode;
  columns: string[];
  addButtonLabel?: string;
  showSearchBar?: boolean;
  onSearch?: (term: string) => void;
  onAddClick?: () => void;
  headerContent?: React.ReactNode;
  isLoading?: boolean;
  hideAddButton?: boolean;
}

export default function LearnListPage<T>({
  title,
  entityType,
  items,
  onFetch,
  onSelect,
  renderRow,
  columns,
  addButtonLabel = "Add",
  showSearchBar = true,
  onSearch,
  onAddClick,
  headerContent,
  isLoading = false,
  hideAddButton = false,
}: LearnListPageProps<T>) {
  const [dropdownOpen, setDropdownOpen] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    onFetch();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-semibold leading-tight">{title}</h3>
          {!isLoading && (
            <span className="text-sm text-gray-600">
              (1 - {items.length} of {items.length})
            </span>
          )}
        </div>
        {!hideAddButton && (
          <div className="flex gap-2">
            <button
              onClick={() => onAddClick && onAddClick()}
              className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
            >
              <FiPlus size={16} />
              {addButtonLabel} {title.slice(0, -1)}
            </button>
          </div>
        )}
      </div>

      {/* Optional Header Content (e.g. filters, search) */}
      {headerContent && <div className="mb-4">{headerContent}</div>}

      {/* Search bar */}
      {showSearchBar && (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Search all ${entityType}`}
            value={searchTerm}
            onChange={handleSearchChange}
            className="border px-3 py-2 rounded w-full max-w-sm text-sm"
          />
          <button className="text-sm text-blue-600 font-medium hover:underline">
            + Add filter
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-10 border rounded bg-gray-50">
          <p className="text-lg font-medium">Loading {title.toLowerCase()}...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border rounded bg-gray-50">
          <p className="text-lg font-medium">No {title.toLowerCase()} added yet</p>
          <p className="text-sm mt-1">
            Click "{addButtonLabel} {title.slice(0, -1)}" to create your first.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 rounded-lg bg-white">
            <thead className="bg-gray-100 text-left text-gray-600 font-medium border-b border-gray-300">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="px-4 py-2 border-r border-gray-200 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 cursor-pointer relative"
                  onClick={() => onSelect(item.id as string | number)}
                >
                  {renderRow(item, dropdownOpen, setDropdownOpen, (_item) => {})}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
