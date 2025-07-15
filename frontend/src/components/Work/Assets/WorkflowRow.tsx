// frontend/src/components/Work/WorkflowRow.tsx

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
}

export default function WorkflowRow({ workflow, onClick }: WorkflowRowProps) {
  return (
    <>
      <td
        onClick={onClick}
        className="px-4 py-3 border-r border-gray-100 font-semibold text-gray-900"
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
      <td className="px-4 py-3 text-right">
        <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">
          Create Work Order
        </button>
      </td>
    </>
  );
}
