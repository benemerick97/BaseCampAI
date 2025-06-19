// src/components/Work/Builder/WorkflowContext.tsx

import React, { createContext, useContext, useState } from "react";
import { useNodesState, useEdgesState } from "reactflow";
import type { Node, Edge } from "reactflow";
import type { Step } from "./sharedTypes";

interface WorkflowContextType {
  steps: Step[];
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onNodesChange: ReturnType<typeof useNodesState>[2];
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: ReturnType<typeof useEdgesState>[2];
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error("useWorkflow must be used inside a WorkflowProvider");
  return context;
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<Step[]>([
    { id: "start", label: "Start Workflow", inputType: "text" },
  ]);
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "start",
      type: "custom",
      data: { label: "Start Workflow", inputType: "text" },
      position: { x: 300, y: 50 },
      draggable: false,
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  return (
    <WorkflowContext.Provider
      value={{
        steps,
        setSteps,
        nodes,
        setNodes,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};
