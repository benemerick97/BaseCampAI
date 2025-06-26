// types/WorkflowData.ts

import type { Group } from "./Group";
import type { Step } from "./Step";

export interface WorkflowData {
  stepsById: Record<string, Step>;
  groupsById: Record<string, Group>;
  groupOrder: string[];
}
