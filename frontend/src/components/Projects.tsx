import React from "react";

const Projects = () => {
  return (
    <div className="flex h-full w-full text-gray-800 font-sans bg-gray-100">

      {/* Left: Sources Panel */}
      <div className="w-[280px] border-r border-gray-200 p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4">Sources</h2>
        <p className="text-sm text-gray-500">Uploaded files and links will appear here.</p>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li className="italic">• source-1.pdf</li>
          <li className="italic">• notes.txt</li>
          <li className="italic">• research-link.com</li>
        </ul>
      </div>

      {/* Middle: Chat Panel */}
      <div className="flex-1 border-r border-gray-200 p-6 bg-white flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Project Assistant</h2>
          <span className="text-sm text-gray-400">Alpha</span>
        </div>

        <div className="flex-1 bg-white border border-gray-300 rounded-xl p-6 shadow-sm flex items-center justify-center text-sm text-gray-500">
          <p>Chat interface will go here.</p>
        </div>
      </div>

      {/* Right: Admin Panel */}
      <div className="w-[320px] p-6 bg-white flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-4">Project Settings</h2>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Project Description
            </label>
            <textarea
              id="description"
              placeholder="Describe the purpose of this project..."
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Tools</h3>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
              Create Document
            </button>
            <button className="w-full px-3 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">
              Upload File
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Projects;
