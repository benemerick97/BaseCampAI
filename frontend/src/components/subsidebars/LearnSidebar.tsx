import React from "react";
import { FiBookOpen, FiLayers, FiPlay } from "react-icons/fi";

const LearnSidebar = ({ setMainPage }: { setMainPage: (page: string) => void }) => {
  return (
    <>
      <h2 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
        <FiBookOpen className="text-base" /> Learn
      </h2>
      <div className="flex flex-col gap-2 text-gray-700">
        <button
          onClick={() => setMainPage("learn")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiPlay /> Start Training
        </button>
        <button className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded">
          <FiLayers /> My Courses
        </button>
      </div>
      <hr className="my-4" />
      <div className="text-xs text-gray-500">Suggestions</div>
      <button className="mt-2 text-blue-600 hover:underline text-sm">Add a Course</button>
    </>
  );
};

export default LearnSidebar;
