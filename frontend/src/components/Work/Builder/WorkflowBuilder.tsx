import React, { useState } from "react";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import ListEditor from "./ListEditor";
import FlowEditor from "./FlowEditor";
import { useWorkflow } from "./WorkflowContext";

let stepIdCounter = 1;

export default function WorkflowBuilder() {
  const [mode, setMode] = useState<"list" | "flow">("list");

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
    const id = `step-${stepIdCounter++}`;
    const label = `Step ${steps.length}`;
    const inputType = "text";

    setSteps((prev) => [...prev, { id, label, inputType }]);

    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "custom",
        data: { label, inputType },
        position: { x: 300, y: 100 + nds.length * 120 },
      },
    ]);

    const lastId = nodes[nodes.length - 1]?.id;
    if (lastId) {
      setEdges((eds) => [
        ...eds,
        { id: `edge-${lastId}-${id}`, source: lastId, target: id },
      ]);
    }
  };

  const updateStep = (id: string, updates: Partial<{ label: string; inputType: string }>) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, ...updates } : step))
    );
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
      )
    );
  };

  const deleteStep = (id: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", padding: "20px", borderRight: "1px solid #eee" }}>
        <h2 className="text-lg font-semibold mb-4">Workflow Builder</h2>
        <button onClick={addStep} className="mb-2 w-full py-2 bg-blue-600 text-white rounded">
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
      <div style={{ flex: 1, padding: "20px" }}>
        {mode === "flow" ? (
          <ReactFlowProvider>
            <FlowEditor />
          </ReactFlowProvider>
        ) : (
          <ListEditor />
        )}
      </div>
    </div>
  );
}
