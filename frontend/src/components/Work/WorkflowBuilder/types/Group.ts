// types/Group.ts

export interface Group {
  id: string;
  label: string;
  stepIds: string[]; // List of Step IDs that belong to this group
}