// src/components/Work/Builder/sharedTypes.ts

import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { InputType } from "../../../constants/inputTypes"; // Use the central definition
export type { InputType };

// Input field type for form elements
export interface InputField {
  id: string;
  label: string;
  type: InputType;
  prefix?: string;
  suffix?: string;
  options?: string[]; // Only used for "select"
  default?: string;
  required?: boolean;
}

// Main workflow step
export interface Step {
  id: string;
  label: string;
  instructions: string;
  inputFields: InputField[];
  groupId?: string; // ✅ NEW — optional group ID
}

// Visual drag/drop + interaction props for a step component
export interface SortableStepProps {
  id: string;
  label: string;
  instructions: string;
  inputFields: InputField[];
  isExpanded: boolean;
  onExpand: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  menuOpen: boolean;
  toggleMenu: () => void;
  onChangeLabel: (val: string) => void;
  onChangeInstructions: (val: string) => void;
  onChangeInputFields: (fields: InputField[]) => void;
  dragHandleProps?: {
    setNodeRef?: (el: HTMLElement | null) => void;
    transform?: { x: number; y: number };
    transition?: string;
    isDragging?: boolean;
    attributes?: Record<string, any>;
    listeners?: DraggableSyntheticListeners;
  };
}

// ✅ NEW — Group definition
export interface StepGroup {
  id: string;
  label: string;
}
