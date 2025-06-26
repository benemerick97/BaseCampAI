
interface StepBlockProps {
  title: string;
  inputType: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function StepBlock({ title, inputType, onEdit, onDelete }: StepBlockProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow border border-gray-200 px-4 py-3 w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 w-full">
        <span className="font-medium text-gray-800">{title}</span>
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {inputType}
        </span>
      </div>
      <div className="flex items-center gap-3 ml-4">
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Edit"
          >
            ⚙
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 text-sm"
            title="Delete"
          >
            ✖
          </button>
        )}
      </div>
    </div>
  );
}
