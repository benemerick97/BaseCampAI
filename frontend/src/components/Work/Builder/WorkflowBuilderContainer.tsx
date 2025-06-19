import React from "react";
import { WorkflowProvider } from "./WorkflowContext";
import WorkflowBuilder from "./WorkflowBuilder";

export default function WorkflowBuilderContainer() {
  return (
    <WorkflowProvider>
      <WorkflowBuilder />
    </WorkflowProvider>
  );
}
