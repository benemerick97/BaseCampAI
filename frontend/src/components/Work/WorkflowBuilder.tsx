import React, { useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState
} from "reactflow";
import "reactflow/dist/style.css";

let nodeId = 1;

const createStep = (label: string, yOffset = 150) => ({
  id: `step-${nodeId++}`,
  data: { label },
  position: { x: 300, y: 50 + yOffset * (nodeId - 2) },
});

export default function WorkflowBuilder() {
  const [mode, setMode] = useState<"list" | "flow">("list");
  const [steps, setSteps] = useState([{ id: "start", label: "Start Workflow" }]);

  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "start",
      type: "input",
      data: { label: "Start Workflow" },
      position: { x: 300, y: 50 },
      draggable: false,
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const addStep = () => {
    const label = `Step ${steps.length}`;
    const newStep = { id: `step-${steps.length}`, label };

    setSteps((prev) => [...prev, newStep]);

    const newNode = createStep(label);
    setNodes((nds) => [...nds, newNode]);

    const lastId = nodes[nodes.length - 1]?.id;
    setEdges((eds) => [
      ...eds,
      { id: `edge-${lastId}-${newNode.id}`, source: lastId, target: newNode.id },
    ]);
  };

  const updateStepLabel = (id: string, label: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label } : s))
    );
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n))
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", padding: "20px", borderRight: "1px solid #eee" }}>
        <h2>Workflow Builder</h2>
        <button onClick={addStep} style={{ margin: "10px 0", padding: "8px" }}>
          + Add Step
        </button>
        <button onClick={() => setMode(mode === "list" ? "flow" : "list")} style={{ padding: "8px" }}>
          Switch to {mode === "list" ? "Flow View" : "List View"}
        </button>

        {mode === "list" && (
          <div style={{ marginTop: "20px" }}>
            {steps.map((step) => (
              <div key={step.id} style={{ marginBottom: "12px" }}>
                <input
                  type="text"
                  value={step.label}
                  onChange={(e) => updateStepLabel(step.id, e.target.value)}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        {mode === "flow" && (
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
              fitView
              panOnScroll
              zoomOnScroll
            >
              <Controls />
              <MiniMap />
              <Background gap={20} />
            </ReactFlow>
          </ReactFlowProvider>
        )}
      </div>
    </div>
  );
}
