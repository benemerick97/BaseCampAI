import { FiFolder, FiPlus, FiFileText, FiPlay } from "react-icons/fi";

const ProjectsSidebar = ({ setMainPage }: { setMainPage: (page: string) => void }) => {
  return (
    <>
      <h2 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
        <FiFolder className="text-base" /> Workspaces
      </h2>
      <div className="flex flex-col gap-2 text-gray-700">
        <button className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded">
          <FiFileText /> All Workspaces
        </button>
        <button
          onClick={() => setMainPage("projects")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiPlay /> Test Workspace
        </button>
        <button className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded">
          <FiPlus /> Create Workspace
        </button>
      </div>
      <hr className="my-4" />
      <div className="text-xs text-gray-500">Library</div>
      <button className="mt-2 text-blue-600 hover:underline text-sm">Create a Template</button>
    </>
  );
};

export default ProjectsSidebar;
