// src/constants/inputTypes.ts

import {
  FiEdit,
  FiCalendar,
  FiList,
  FiHash,
  FiCheckSquare,
  FiAlignLeft,
} from "react-icons/fi";

// 1. Define the base types as a readonly tuple
export const inputTypes = [
  "text",
  "date",
  "select",
  "number",
  "checkbox",
  "textarea",
] as const;

// 2. Auto-derive the union type from the above array
export type InputType = (typeof inputTypes)[number];

// 3. Use the union to define metadata for each type
export const INPUT_TYPE_OPTIONS: {
  type: InputType;
  label: string;
  icon: React.ElementType;
}[] = [
  { type: "text", label: "Text", icon: FiEdit },
  { type: "date", label: "Date", icon: FiCalendar },
  { type: "select", label: "Dropdown", icon: FiList },
  { type: "number", label: "Number", icon: FiHash },
  { type: "checkbox", label: "Checkbox", icon: FiCheckSquare },
  { type: "textarea", label: "Paragraph", icon: FiAlignLeft },
];
