//frontend/src/components/Work/Builder/CustomNode.tsx

import React from "react";
import { Handle } from "reactflow";
import { Position } from "reactflow";

type CustomNodeProps = {
  data: {
    label: string;
    inputType: string;
  };
};

export default function CustomNode({ data }: CustomNodeProps) {
  return (
    <div className="bg-white border border-gray-300 rounded shadow-md p-4 min-w-[180px] text-sm text-gray-800">
      <div className="font-semibold mb-2">{data.label}</div>
      <div className="text-gray-600">Input: {data.inputType}</div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}
