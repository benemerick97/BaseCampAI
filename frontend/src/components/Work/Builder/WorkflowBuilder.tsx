// frontend/src/components/Work/Builder/WorkflowBuilder.tsx

import React, { useState, useRef } from "react";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import ListEditor from "./ListEditor";
import FlowEditor from "./FlowEditor";
import { useWorkflow } from "./WorkflowContext";
import type { InputField } from "./sharedTypes";

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
    const label = `Step ${steps.length}`;
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

  const updateStep = (
    id: string,
    updates: Partial<{
      label: string;
      instructions: string;
      inputFields: InputField[];
    }>
  ) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, ...updates } : step))
    );
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...updates } } : node
      )
    );
  };

  const deleteStep = (id: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setEdges((prev) =>
      prev.filter((edge) => edge.source !== id && edge.target !== id)
    );
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-[250px] p-5 border-r border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Workflow Builder</h2>
        <button
          onClick={addStep}
          className="mb-2 w-full py-2 bg-blue-600 text-white rounded"
        >
          + Add Step
        </button>
        <button
          onClick={() => setMode(mode === "list" ? "flow" : "list")}
          className="w-full py-2 border rounded"
        >
          Switch to {mode === "list" ? "Flow View" : "List View"}
        </button>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 p-5">
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
  );
}
