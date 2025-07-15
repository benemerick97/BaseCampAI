import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import EntityListPage from "./EntityListPage";
import WorkflowRow from "./WorkflowRow";
import ConfirmModal from "../../Shared/ConfirmModal";

import { useWorkflowStore } from "../WorkflowBuilder/context/useWorkflowStore";

interface WorkflowItem {
  id: number;
  name: string;
  description?: string;
  is_template: boolean;
  created_at?: string;
  updated_at?: string;
}

interface WorkflowProps {
  setMainPage: (page: string) => void;
}

export default function Workflow({ setMainPage }: WorkflowProps) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();

  const resetWorkflow = useWorkflowStore((s) => s.resetWorkflow);
  const loadWorkflowFromData = useWorkflowStore((s) => s.loadWorkflowFromData);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<WorkflowItem | null>(null);

  const { data: workflows = [], refetch } = useQuery<WorkflowItem[]>({
    queryKey: ["workflows", user?.organisation?.id],
    queryFn: async () => {
      const res = await api.get("/workflows/", {
        headers: {
          "x-org-id": user?.organisation?.id?.toString() ?? "",
        },
      });
      return res.data;
    },
    enabled: !!user?.organisation?.id,
  });

  const handleViewWorkflow = (workflow: WorkflowItem) => {
    setSelectedEntity({ type: "workflow", id: workflow.id });
    setMainPage("workflowdetails");
  };

  const handleEditWorkflow = async (workflow: WorkflowItem) => {
    try {
      const res = await api.get(`/workflows/${workflow.id}`, {
        headers: {
          "x-org-id": user?.organisation?.id?.toString() ?? "",
        },
      });

      const fullWorkflow = res.data;

      // Reset and load workflow into builder state
      resetWorkflow();
      loadWorkflowFromData(fullWorkflow);

      // Store metadata for title sync, etc.
      setSelectedEntity({
        type: "workflow",
        id: fullWorkflow.id,
        data: fullWorkflow,
      });

      // Navigate to builder
      setMainPage("workflowbuilder");
    } catch (err) {
      console.error("Failed to load workflow:", err);
    }
  };

  const handleDeleteWorkflow = (id: number) => {
    const workflow = workflows.find((w) => w.id === id);
    if (workflow) {
      setSelectedToDelete(workflow);
      setShowConfirm(true);
    }
  };

  const confirmDeleteWorkflow = async () => {
    if (!selectedToDelete) return;
    try {
      await api.delete(`/workflows/${selectedToDelete.id}`, {
        headers: {
          "x-org-id": user?.organisation?.id?.toString() ?? "",
        },
      });
      await refetch();
    } catch (err) {
      console.error("Failed to delete workflow:", err);
    } finally {
      setShowConfirm(false);
      setSelectedToDelete(null);
    }
  };

  const handleCreateWorkOrder = (workflow: WorkflowItem) => {
    console.log("Create Work Order for", workflow.id);
    // TODO: Route to work order builder or modal
  };

  const renderRow = (
    workflow: WorkflowItem,
    _openDropdown: number | null,
    _setOpenDropdown: (id: number | null) => void,
    _openEditModal: (item: WorkflowItem) => void
  ) => (
    <WorkflowRow
      workflow={workflow}
      onClick={() => handleViewWorkflow(workflow)}
      onEdit={handleEditWorkflow}
      onDelete={handleDeleteWorkflow}
      onCreateWorkOrder={handleCreateWorkOrder}
    />
  );

  return (
    <>
      <EntityListPage<WorkflowItem>
        title="Workflows"
        entityType="workflow"
        items={workflows}
        onFetch={() => refetch().then(() => {})}
        onSelect={(id) => {
          setSelectedEntity({ type: "workflow", id });
          setMainPage("workflowdetails");
        }}
        renderRow={renderRow}
        columns={["Title", "Description", "Last Updated", "Created", "Actions"]}
        addButtonLabel="Create"
        showSearchBar={true}
        onAddClick={() => setMainPage("workflowbuilder")}
      />

      <ConfirmModal
        open={showConfirm}
        title="Delete Workflow?"
        description={`Are you sure you want to delete "${selectedToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteWorkflow}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
