// frontend/src/components/Work/Builder/WorkflowBuilderContainer.tsx

import { WorkflowProvider } from "./WorkflowContext";
import WorkflowBuilder from "./WorkflowBuilder";

interface WorkflowBuilderContainerProps {
  setMainPage: (page: string) => void;
}

export default function WorkflowBuilderContainer({ setMainPage }: WorkflowBuilderContainerProps) {
  return (
    <WorkflowProvider>
      <WorkflowBuilder setMainPage={setMainPage} />
    </WorkflowProvider>
  );
}
