

interface EmptyTabProps {
  label: string;
  onAddClick?: () => void;
}

export default function EmptyTab({ label, onAddClick }: EmptyTabProps) {
  return (
    <div className="text-center py-10 text-sm text-gray-500 border rounded bg-gray-50">
      <p className="text-lg font-semibold mb-1">No {label} found</p>
      <p className="mb-2">
        This site doesn’t have any registered {label.toLowerCase()} yet.
      </p>
      <button
        onClick={onAddClick}
        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Add {label.slice(0, -1)}
      </button>
    </div>
  );
}
