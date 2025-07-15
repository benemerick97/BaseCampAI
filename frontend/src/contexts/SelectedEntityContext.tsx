// contexts/SelectedEntityContext.tsx

import React, { createContext, useContext, useState } from "react";

type EntityType = 
  | "site"
  | "asset" 
  | "workorder"
  | "workflow" 
  | "project" 
  | "file"
  | "course"
  | "skill"
  | "module"
  | "user"
  | "assignedSkill"
  | "assignedCourse"
  | "assignedModule"
  ; 

interface SelectedEntity {
  type: EntityType;
  id: number | string;
  data?: any;
}

interface SelectedEntityContextType {
  selectedEntity: SelectedEntity | null;
  setSelectedEntity: (entity: SelectedEntity) => void;
  clearSelectedEntity: () => void;
}

const SelectedEntityContext = createContext<SelectedEntityContextType | undefined>(undefined);

export const SelectedEntityProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);

  const clearSelectedEntity = () => setSelectedEntity(null);

  return (
    <SelectedEntityContext.Provider
      value={{ selectedEntity, setSelectedEntity, clearSelectedEntity }}
    >
      {children}
    </SelectedEntityContext.Provider>
  );
};

export const useSelectedEntity = () => {
  const context = useContext(SelectedEntityContext);
  if (!context) {
    throw new Error("useSelectedEntity must be used within a SelectedEntityProvider");
  }
  return context;
};

export type { SelectedEntity, EntityType }; 
