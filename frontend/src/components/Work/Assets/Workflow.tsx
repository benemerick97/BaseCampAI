// frontend/src/components/Work/Workflow.tsx

import { useQuery } from "@tanstack/react-query";
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import EntityListPage from "./EntityListPage";
import WorkflowRow from "./WorkflowRow";

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
    enabled: !!user?.organisation?.id, // wait for user to load
  });

  const handleSelect = (id: number) => {
    setSelectedEntity({ type: "workflow", id });
    setMainPage("workflowdetails");
  };

  const renderRow = (
    workflow: WorkflowItem,
    _openDropdown: number | null,
    _setOpenDropdown: (id: number | null) => void,
    _openEditModal: (item: WorkflowItem) => void
  ) => (
    <WorkflowRow
      workflow={workflow}
      onClick={() => handleSelect(workflow.id)}
    />
  );

  return (
    <EntityListPage<WorkflowItem>
      title="Workflows"
      entityType="workflow"
      items={workflows}
      onFetch={() => refetch().then(() => {})}
      onSelect={handleSelect}
      renderRow={renderRow}
      columns={["Title", "Description", "Last Updated", "Created", "Actions"]}
      addButtonLabel="Create"
      showSearchBar={true}
      onAddClick={() => setMainPage("workflowbuilder")}
    />
  );
}
