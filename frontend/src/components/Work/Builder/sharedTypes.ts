// src/components/Work/Builder/sharedTypes.ts

export type InputType = 
  | "text"
  | "date"
  | "select"
  | "number"
  | "checkbox"
  | "textarea";

export interface Step {
  id: string;
  label: string;
  inputType: InputType;
}
