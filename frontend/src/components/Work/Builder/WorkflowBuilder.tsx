// frontend/src/components/Work/Builder/WorkflowBuilder.tsx

import { useState, useRef } from "react";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import ListEditor from "./ListEditor/ListEditor";
import FlowEditor from "./FlowEditor";
import { useWorkflow } from "./WorkflowContext";
import type { InputField } from "./sharedTypes";
import { FiPlus, FiEdit3, FiMoreHorizontal } from "react-icons/fi";

interface WorkflowBuilderProps {
  setMainPage: (page: string) => void;
}

export default function WorkflowBuilder({ setMainPage }: WorkflowBuilderProps) {
  const [mode, setMode] = useState<"list" | "flow">("list");
  const [workflowTitle, setWorkflowTitle] = useState("Untitled Workflow");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const stepIdCounter = useRef(1);
  const groupIdCounter = useRef(1); // 🆕

  const {
    steps,
    setSteps,
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    groups,
    setGroups, // 🆕
  } = useWorkflow();

  const addStep = () => {
    const id = `step-${stepIdCounter.current++}`;
    const label = "";
    const instructions = "";
    const inputFields: InputField[] = [];

    setSteps((prevSteps) => [
      ...prevSteps,
      { id, label, instructions, inputFields },
    ]);

    setNodes((prevNodes) => {
      const position = { x: 300, y: 100 + prevNodes.length * 120 };
      return [
        ...prevNodes,
        {
          id,
          type: "custom",
          data: { label, instructions, inputFields },
          position,
        },
      ];
    });

    setEdges((prevEdges) => {
      const lastNode = nodes[nodes.length - 1];
      if (lastNode) {
        return [
          ...prevEdges,
          {
            id: `edge-${lastNode.id}-${id}`,
            source: lastNode.id,
            target: id,
          },
        ];
      }
      return prevEdges;
    });
  };

  const addGroup = () => {
    const id = `group-${groupIdCounter.current++}`;
    const label = `New Section ${groupIdCounter.current - 1}`;

    setGroups((prev) => [...prev, { id, label }]);
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="h-[72px] px-6 py-4 border-b bg-white shadow-sm flex items-center justify-between">
        {/* Left: Back Button and Title */}
        <div className="w-1/3 flex items-center gap-3">
          <button
            onClick={() => setMainPage("workflow")}
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            ← Back to Workflows
          </button>
        </div>

        {/* Center: Editable Title */}
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

        {/* Right: Buttons */}
        <div className="w-1/3 flex justify-end items-center gap-3">
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => console.log("Settings menu open")}
          >
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-4xl mx-auto">
          {mode === "flow" ? (
            <ReactFlowProvider>
              <FlowEditor
                nodes={nodes}
                setNodes={setNodes}
                onNodesChange={onNodesChange}
                edges={edges}
                setEdges={setEdges}
                onEdgesChange={onEdgesChange}
              />
            </ReactFlowProvider>
          ) : (
            <ListEditor />
          )}
        </div>
      </div>

      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 items-end z-50 ">
        <button
          onClick={addStep}
          title="Add a new step"
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all text-md"
        >
          <FiPlus className="text-md" />
          <span className="text-base font-semibold text-md">Step</span>
        </button>
        <button
          onClick={addGroup}
          title="Add a new section"
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all"
        >
          <FiPlus className="text-md" />
          <span className="text-base font-semibold text-md">Section</span>
        </button>
      </div>
    </div>
  );
}
