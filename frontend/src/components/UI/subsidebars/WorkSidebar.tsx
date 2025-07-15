
import { FiClipboard, FiMapPin, FiPlay, FiPackage, FiPaperclip, FiCheckSquare, FiFileText, FiList, FiLink } from "react-icons/fi";

const WorkSidebar = ({ setMainPage }: { setMainPage: (page: string) => void }) => {
  return (
    <>
      <h2 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
        <FiClipboard className="text-base" /> Work
      </h2>
      <div className="flex flex-col gap-2 text-gray-700">
        <button
          onClick={() => setMainPage("workflow")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiList /> Workflows
        </button>
        <button
          onClick={() => setMainPage("workorders")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiFileText /> Work Orders
        </button>
        <button
          onClick={() => setMainPage("workproject")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiPlay /> Projects?
        </button>
        <button
          onClick={() => setMainPage("tasks")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiCheckSquare /> Tasks
        </button>
        <button
          onClick={() => setMainPage("placeholder")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiLink /> Automations
        </button>
        <button
          onClick={() => setMainPage("assets")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiPackage /> Assets
        </button>
        <button
          onClick={() => setMainPage("sites")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiMapPin /> Sites
        </button>
        <button
          onClick={() => setMainPage("content")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiPaperclip /> Content
        </button>
      </div>
      <hr className="my-4" />
      <div className="text-xs text-gray-500">Tools</div>
       <button
        onClick={() => setMainPage("workflowbuilder")}
        className="w-full mt-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
        Create Workflow
        </button>
    </>
  );
};

export default WorkSidebar;
