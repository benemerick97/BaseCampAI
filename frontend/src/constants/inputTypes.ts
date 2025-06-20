// src/constants/inputTypes.ts

import {
  FiEdit,
  FiCalendar,
  FiList,
  FiHash,
  FiCheckSquare,
  FiAlignLeft,
} from "react-icons/fi";

import type { InputType } from "../components/Work/Builder/sharedTypes";

export const inputTypes: InputType[] = [
  "text",
  "date",
  "select",
  "number",
  "checkbox",
  "textarea",
];

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
