// frontend/src/components/LMS/Module/MyModuleRow.tsx

interface Module {
  id: string;
  name: string;
  description?: string;
  org_id: string;
  created_at: string;
}

interface AssignedModule {
  id: number;
  user_id: number;
  module_id: string;
  assigned_at: string;
  due_date?: string;
  completed_at?: string;
  status: "assigned" | "completed";
  module: Module;
}

interface MyModuleRowProps {
  assignment: AssignedModule;
  onStart: (moduleId: string) => void;
}

const MyModuleRow: React.FC<MyModuleRowProps> = ({ assignment, onStart }) => {
  const { module, assigned_at, completed_at, status } = assignment;

  return (
    <>
      <td className="px-4 py-3 border-r border-gray-100 font-semibold text-gray-900 cursor-pointer">
        {module.name}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
        {module.description || "—"}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-center text-gray-700">
        {new Date(assigned_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-center text-gray-700">
        {assignment.due_date
            ? new Date(assignment.due_date).toLocaleDateString()
            : "—"}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-center text-gray-700">
        {status === "completed"
          ? new Date(completed_at!).toLocaleDateString()
          : "—"}
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-center text-gray-700">
        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100">
          {status}
        </span>
      </td>
      <td className="px-4 py-3 border-r border-gray-100 text-right">
        {status === "completed" ? (
          <span className="text-sm text-gray-400">Done</span>
        ) : (
          <button
            className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
            onClick={(e) => {
              e.stopPropagation();
              onStart(module.id);
            }}
          >
            Start
          </button>
        )}
      </td>
    </>
  );
};

export default MyModuleRow;