// types/Step.ts

import type { InputField } from "./InputField";

export interface Step {
  id: string;
  label: string;
  groupId: string;
  inputFields: InputField[];
  instructions: string; // The group this step belongs to
}
