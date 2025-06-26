import { FiPlus, FiEdit3, FiUpload } from "react-icons/fi";

interface WorkflowItem {
  title: string;
  description: string;
  date: string;
}

interface WorkflowProps {
  setMainPage: (page: string) => void;
}

const workflows: WorkflowItem[] = [
];

export default function Workflow({ setMainPage }: WorkflowProps) {
  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-semibold leading-tight">Workflows</h3>
          <span className="text-sm text-gray-600">(1 - {workflows.length} of {workflows.length})</span>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 border border-blue-600 text-blue-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-50">
            <FiEdit3 size={16} />
            Describe
          </button>
          <button className="flex items-center gap-1 border border-blue-600 text-blue-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-50">
            <FiUpload size={16} />
            Upload
          </button>
          <button 
            onClick={() => setMainPage("workflow_builder")}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700">
            <FiPlus size={16} />
            Create Workflow
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search all templates"
          className="border px-3 py-2 rounded w-full max-w-sm text-sm"
        />
        <button className="text-sm text-blue-600 font-medium">+ Add filter</button>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border rounded bg-gray-50">
          <p className="text-lg font-medium">No workflows created yet</p>
          <p className="text-sm mt-1">Click "Create Workflow" to add your first one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 rounded-lg bg-white">
            <thead className="bg-gray-100 text-left text-gray-600 font-medium border-b border-gray-300">
              <tr>
                <th className="px-4 py-2 border-r border-gray-200">Title</th>
                <th className="px-4 py-2 border-r border-gray-200">Description</th>
                <th className="px-4 py-2 border-r border-gray-200 whitespace-nowrap">Last Published</th>
                <th className="px-4 py-2 border-r border-gray-200">Access</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((workflow, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-100 font-semibold text-gray-900">{workflow.title}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-700">{workflow.description}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-600">{workflow.date}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-600">All users</td>
                  <td className="px-4 py-3 text-right">
                    <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">
                      Create Work Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
