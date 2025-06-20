// components/StepOptionsModal.tsx

import React from "react";

interface StepOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  stepLabel: string;
}

export default function StepOptionsModal({
  isOpen,
  onClose,
  onDelete,
  onDuplicate,
  stepLabel,
}: StepOptionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded shadow-lg w-[320px]">
        <h2 className="text-lg font-semibold mb-4">Options for "{stepLabel}"</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onDuplicate();
              onClose();
            }}
            className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm"
          >
            Duplicate Step
          </button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
          >
            Delete Step
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
