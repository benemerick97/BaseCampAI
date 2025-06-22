// frontend/src/components/Work/Builder/WorkflowBuilder.tsx

import { useState, useRef } from "react";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import ListEditor from "./ListEditor";
import FlowEditor from "./FlowEditor";
import { useWorkflow } from "./WorkflowContext";
import type { InputField } from "./sharedTypes";
import { FiPlus } from "react-icons/fi";

export default function WorkflowBuilder() {
  const [mode, setMode] = useState<"list" | "flow">("list");
  const stepIdCounter = useRef(1);

  const {
    steps,
    setSteps,
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
  } = useWorkflow();

  const addStep = () => {
    const id = `step-${stepIdCounter.current++}`;
    const label = `Step ${steps.length + 1}`;
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

  return (
    <div className="relative h-full flex flex-col">
      {/* Header stays pinned inside the panel */}
      <div className="h-[72px] px-6 py-4 border-b bg-white shadow-sm flex items-center justify-between">
        <h2 className="text-xl font-semibold">Workflow Builder</h2>
        <div className="flex gap-3">
          <button
            onClick={addStep}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FiPlus className="text-lg" />
            <span>Add Step</span>
          </button>
          <button
            onClick={() => setMode(mode === "list" ? "flow" : "list")}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Switch to {mode === "list" ? "Flow View" : "List View"}
          </button>
        </div>
      </div>

      {/* Scrollable content area below the header */}
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

      {/* Floating add button */}
      <button
        onClick={addStep}
        title="Add a new step"
        className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
      >
        <FiPlus className="text-lg" />
        <span className="font-medium">Step</span>
      </button>
    </div>
  );
}
