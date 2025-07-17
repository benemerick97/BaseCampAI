// frontend/src/components/Work/WorkflowBuilder/useWorkflowSave.ts

import { useRef, useState } from "react";
import debounce from "lodash/debounce";
import api from "../../../../utils/axiosInstance";
import type { WorkflowPayload, SaveState } from "./types";

export function useWorkflowSave(selectedId: number | undefined) {
  const [saveStatus, setSaveStatus] = useState<SaveState>("idle");

  const debouncedAutosave = useRef(
    debounce(async (partial: Partial<WorkflowPayload>) => {
      if (!selectedId) return;
      try {
        setSaveStatus("autosaving");
        await api.patch(`/workflows/${selectedId}/autosave`, partial, {
          headers: {
            "x-org-id": localStorage.getItem("org_id")!,
          },
        });
        setSaveStatus("saved");
      } catch (err) {
        console.error("Autosave failed", err);
        setSaveStatus("error");
      }
    }, 2000)
  ).current;

  const handleManualSave = async (payload: WorkflowPayload) => {
    try {
      setSaveStatus("saving");
      const orgId = localStorage.getItem("org_id")!;
      const res = await api.put(`/workflows/${selectedId}`, payload, {
        headers: {
          "x-org-id": orgId,
        },
      });
      setSaveStatus("saved");
      return res.data.status;
    } catch (err) {
      console.error("Manual save failed", err);
      setSaveStatus("error");
      return null;
    }
  };

  return { saveStatus, debouncedAutosave, handleManualSave };
}
