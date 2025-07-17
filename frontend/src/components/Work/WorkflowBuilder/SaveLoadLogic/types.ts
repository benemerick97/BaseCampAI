// frontend/src/components/Work/WorkflowBuilder/types.ts

export type WorkflowStatus = "draft" | "published" | "archived";
export type SaveState = "idle" | "autosaving" | "saving" | "saved" | "error";

export interface InputFieldPayload {
  label: string;
  input_type: string;
  required: boolean;
  options?: {
    values: string[];
  };
}

export interface StepPayload {
  title: string;
  instructions: string;
  order: number;
  group_index: number;
  inputs: InputFieldPayload[];
}

export interface GroupPayload {
  name: string;
  order: number;
}

export interface WorkflowPayload {
  name: string;
  description: string;
  is_template: boolean;
  status?: WorkflowStatus;
  groups: GroupPayload[];
  steps: StepPayload[];
}
