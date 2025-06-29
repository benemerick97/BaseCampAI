
import { FiPlus, FiEdit3, FiUpload } from "react-icons/fi";

interface TaskItem {
  title: string;
  assignedTo: string;
  dueDate: string;
}

interface TaskProps {
  setMainPage: (page: string) => void;
}

const tasks: TaskItem[] = [
];

export default function Tasks({ setMainPage }: TaskProps) {
  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-semibold leading-tight">Tasks</h3>
          <span className="text-sm text-gray-600">(1 - {tasks.length} of {tasks.length})</span>
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
            onClick={() => setMainPage("task_creator")}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700">
            <FiPlus size={16} />
            Add Task
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search all tasks"
          className="border px-3 py-2 rounded w-full max-w-sm text-sm"
        />
        <button className="text-sm text-blue-600 font-medium">+ Add filter</button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border rounded bg-gray-50">
          <p className="text-lg font-medium">No tasks added yet</p>
          <p className="text-sm mt-1">Click "Add Task" to create your first one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 rounded-lg bg-white">
            <thead className="bg-gray-100 text-left text-gray-600 font-medium border-b border-gray-300">
              <tr>
                <th className="px-4 py-2 border-r border-gray-200">Title</th>
                <th className="px-4 py-2 border-r border-gray-200">Assigned To</th>
                <th className="px-4 py-2 border-r border-gray-200 whitespace-nowrap">Due Date</th>
                <th className="px-4 py-2 border-r border-gray-200">Status</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-100 font-semibold text-gray-900">{task.title}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-700">{task.assignedTo}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-600">{task.dueDate}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-600">Pending</td>
                  <td className="px-4 py-3 text-right">
                    <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">
                      View
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
