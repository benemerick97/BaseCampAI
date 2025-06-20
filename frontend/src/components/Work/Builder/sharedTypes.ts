// src/components/Work/Builder/sharedTypes.ts

export type InputType =
  | "text"
  | "date"
  | "select"
  | "number"
  | "checkbox"
  | "textarea";

export interface InputField {
  id:string;
  label: string;
  type: InputType;
  prefix?: string;
  suffix?: string;
  options?: string[]; // Only used for "select"
}

export interface Step {
  id: string;
  label: string;
  instructions: string;
  inputFields: InputField[];
}

export interface SortableStepProps extends Step {
  isExpanded: boolean;
  onChangeLabel: (val: string) => void;
  onChangeInstructions: (val: string) => void;
  onChangeInputFields: (fields: InputField[]) => void;
  onExpand: () => void;
  onCollapse?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  menuOpen: boolean;
  toggleMenu: () => void;
}
