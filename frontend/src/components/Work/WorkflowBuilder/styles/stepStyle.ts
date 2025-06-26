// frontend/src/components/Work/WorkflowBuilder/styles/stepStyle.ts

export const stepContainerClass = (
  isExpanded: boolean,
  isDragging = false
): string =>
  [
    "flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 transition-all",
    isExpanded ? "pb-4" : "",
    isDragging ? "opacity-0" : "",
  ].join(" ");
