// frontend/src/components/Work/WorkflowBuilder/WorkflowBuilder.tsx 

import { useState } from "react";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import ListEditor from "./ListEditor/ListEditor";
import { useWorkflowStore } from "./context/useWorkflowStore";
import { FiEdit3, FiMoreHorizontal } from "react-icons/fi";

interface WorkflowBuilderProps {
  setMainPage: (page: string) => void;
}

export default function WorkflowBuilder({ setMainPage }: WorkflowBuilderProps) {
  const [mode, setMode] = useState<"list" | "flow">("list");
  const [workflowTitle, setWorkflowTitle] = useState("Untitled Workflow");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const addGroup = useWorkflowStore((state) => state.addGroup);
  const addStep = useWorkflowStore((state) => state.addStep);

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="h-[72px] px-6 py-4 border-b bg-white shadow-sm flex items-center justify-between">
        {/* Left: Back Button */}
        <div className="w-1/3 flex items-center gap-3">
          <button
            onClick={() => setMainPage("workflow")}
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            ← Back to Workflows
          </button>
        </div>

        {/* Center: Title */}
        <div className="w-1/3 flex justify-center">
          {isEditingTitle ? (
            <input
              type="text"
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              className="text-center text-lg font-medium border border-gray-300 rounded px-4 py-1 w-full max-w-xs focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter workflow title"
            />
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setIsEditingTitle(true)}
            >
              <span className="text-lg font-medium text-gray-800">
                {workflowTitle}
              </span>
              <FiEdit3 className="text-gray-500 group-hover:text-gray-700" />
            </div>
          )}
        </div>

        {/* Right: Actions + Mode Switch */}
        <div className="w-1/3 flex justify-end items-center gap-4">
          <button
            onClick={() => setMode((prev) => (prev === "list" ? "flow" : "list"))}
            className="text-sm text-blue-700 underline"
          >
            Switch to {mode === "list" ? "Flow View" : "List View"}
          </button>
          <button className="p-2 rounded hover:bg-gray-100">
            <FiMoreHorizontal className="text-md text-gray-700" />
          </button>
          <button
            onClick={() => console.log("Publish")}
            className="flex items-center gap-1 bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {mode === "flow" ? (
            <ReactFlowProvider>
              {/* Flow View Component Placeholder */}
              <div className="text-center text-gray-500">
                Flow view coming soon...
              </div>
            </ReactFlowProvider>
          ) : (
            <ListEditor />
          )}
        </div>
      </div>
    </div>
  );
}
