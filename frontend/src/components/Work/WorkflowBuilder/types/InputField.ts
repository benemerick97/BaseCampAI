// types/InputField.ts
import type { InputType } from "../../../../constants/inputTypes";
export type { InputType };

export interface InputField {
  id: string;
  label: string;
  type: InputType;
  prefix?: string;
  suffix?: string;
  options?: string[]; // Used for "select"
  default?: string;
  required?: boolean;
}
