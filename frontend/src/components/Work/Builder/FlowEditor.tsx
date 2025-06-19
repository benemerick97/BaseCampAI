import React, { useMemo } from "react";
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  addEdge,
  useReactFlow,
} from "reactflow";
import type {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";


interface FlowEditorProps {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: (changes: EdgeChange[]) => void;
}

export default function FlowEditor({
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
}: FlowEditorProps) {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={(params: Connection) => setEdges((eds) => addEdge(params, eds))}
      nodeTypes={nodeTypes}
      fitView
      panOnScroll
      zoomOnScroll
    >
      <Controls />
      <MiniMap />
      <Background gap={20} />
    </ReactFlow>
  );
}
