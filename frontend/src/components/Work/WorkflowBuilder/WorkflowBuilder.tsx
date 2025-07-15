// frontend/src/components/Work/WorkflowBuilder/WorkflowBuilder.tsx

import { useEffect, useRef, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import ListEditor from "./ListEditor/ListEditor";
import { FiEdit3, FiMoreHorizontal } from "react-icons/fi";
import { useWorkflowStore } from "./context/useWorkflowStore";
import api from "../../../utils/axiosInstance";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import debounce from "lodash/debounce";

interface WorkflowBuilderProps {
  setMainPage: (page: string) => void;
}

type WorkflowStatus = "draft" | "published" | "archived";
type SaveState = "idle" | "autosaving" | "saving" | "saved" | "error";

export default function WorkflowBuilder({ setMainPage }: WorkflowBuilderProps) {
  const [mode, setMode] = useState<"list" | "flow">("list");
  const [workflowTitle, setWorkflowTitle] = useState("Untitled Workflow");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>("draft");
  const [saveStatus, setSaveStatus] = useState<SaveState>("idle");

  const { stepsById, groupsById, groupOrder, resetWorkflow } = useWorkflowStore();
  const { selectedEntity } = useSelectedEntity();

  useEffect(() => {
    if (selectedEntity?.type === "workflow" && selectedEntity.data?.name) {
      setWorkflowTitle(selectedEntity.data.name);
      if (selectedEntity.data?.status) {
        setWorkflowStatus(selectedEntity.data.status);
      }
    } else {
      resetWorkflow();
      setWorkflowTitle("Untitled Workflow");
    }
  }, [selectedEntity, resetWorkflow]);

  const debouncedAutosaveTitle = useRef(
    debounce(async (partial: any) => {
      try {
        setSaveStatus("autosaving");

        await api.patch(`/workflows/${selectedEntity?.id}/autosave`, partial, {
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

  useEffect(() => {
    if (
      selectedEntity?.type === "workflow" &&
      typeof selectedEntity.id === "number" &&
      workflowTitle.trim() !== ""
    ) {
      debouncedAutosaveTitle({ name: workflowTitle });
    }
  }, [workflowTitle]);

  const handleManualSave = async () => {
    try {
      setSaveStatus("saving");

      const orgId = localStorage.getItem("org_id")!;
      const groupIdToIndexMap = groupOrder.reduce((map, id, index) => {
        map[id] = index;
        return map;
      }, {} as Record<string, number>);

      const groups = groupOrder.map((id, i) => ({
        name: groupsById[id].label,
        order: i,
      }));

      const steps = Object.values(stepsById).map((step, index) => ({
        title: step.label,
        instructions: step.instructions,
        order: index,
        group_index: groupIdToIndexMap[step.groupId],
        inputs: step.inputFields.map((input) => ({
          label: input.label,
          input_type: input.type,
          required: input.required ?? false,
          options: input.options?.length ? { values: input.options } : undefined,
        })),
      }));

      const payload = {
        name: workflowTitle,
        description: "",
        is_template: false,
        status: workflowStatus,
        groups,
        steps,
      };

      const res = await api.put(`/workflows/${selectedEntity?.id}`, payload, {
        headers: {
          "x-org-id": orgId,
        },
      });

      setWorkflowStatus(res.data.status);
      setSaveStatus("saved");
    } catch (err) {
      console.error("Manual save failed", err);
      setSaveStatus("error");
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const orgId = localStorage.getItem("org_id");

      if (!orgId || !selectedEntity?.id) {
        alert("Missing organisation or workflow ID");
        setIsPublishing(false);
        return;
      }

      await api.post(`/workflows/${selectedEntity.id}/publish`, null, {
        headers: { "x-org-id": orgId },
      });

      setWorkflowStatus("published");
      alert("Workflow published!");
      setMainPage("workflow");
    } catch (err) {
      console.error("Failed to publish", err);
      alert("Publish failed.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="h-[72px] px-6 py-4 border-b bg-white shadow-sm flex items-center justify-between">
        {/* Left */}
        <div className="w-1/3 flex items-center gap-3">
          <button
            onClick={() => setMainPage("workflow")}
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            ← Back to Workflows
          </button>
        </div>

        {/* Center: Title and Status */}
        <div className="w-1/3 flex flex-col items-center justify-center gap-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              className="text-center text-lg font-medium border border-gray-300 rounded px-4 py-1 w-full max-w-xs focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter workflow title"
            />
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setIsEditingTitle(true)}
            >
              <span className="text-lg font-medium text-gray-800">
                {workflowTitle}
              </span>
              <FiEdit3 className="text-gray-500 group-hover:text-gray-700" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                workflowStatus === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : workflowStatus === "published"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {workflowStatus}
            </span>

            <div className="text-xs text-gray-400">
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "autosaving" && "Autosaving..."}
              {saveStatus === "saved" && "Changes saved ✓"}
              {saveStatus === "error" && "Error saving changes ⚠"}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="w-1/3 flex justify-end items-center gap-4">
          <button
            onClick={() => setMode((prev) => (prev === "list" ? "flow" : "list"))}
            className="text-sm text-blue-700 underline"
          >
            Switch to {mode === "list" ? "Flow View" : "List View"}
          </button>
          <button className="p-2 rounded hover:bg-gray-100">
            <FiMoreHorizontal className="text-md text-gray-700" />
          </button>
          <button
            onClick={handleManualSave}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-1 bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {mode === "flow" ? (
            <ReactFlowProvider>
              <div className="text-center text-gray-500">
                Flow view coming soon...
              </div>
            </ReactFlowProvider>
          ) : (
            <ListEditor />
          )}
        </div>
      </div>
    </div>
  );
}
