// frontend/src/components/LMS/ModuleBuilder/MyModuleDetails.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import { FiBookOpen } from "react-icons/fi";
import DetailsPage from "../../Shared/DetailsPage";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface Module {
  id: string;
  name: string;
  description?: string;
  org_id: number;
  created_at: string;
}

interface AssignedModule {
  id: number;
  user_id: number;
  module_id: string;
  assigned_at: string;
  due_date?: string;
  completed_at?: string;
  status: "assigned" | "completed";
  module: Module;
}

interface MyModuleDetailsProps {
  setMainPage: (page: string) => void;
}

export default function MyModuleDetails({ setMainPage }: MyModuleDetailsProps) {
  const { user } = useAuth();
  const { selectedEntity, clearSelectedEntity } = useSelectedEntity();
  const [assignment, setAssignment] = useState<AssignedModule | null>(null);

  useEffect(() => {
    if (!selectedEntity || selectedEntity.type !== "assignedModule") return;

    axios
      .get(`${BACKEND_URL}/learn/assigned-modules/${selectedEntity.id}`, {
        params: { organisation_id: user?.organisation?.id },
      })
      .then((res) => setAssignment(res.data))
      .catch((err) => console.error("Error loading assigned module details:", err));
  }, [selectedEntity]);

  if (!assignment) return <div className="p-6">Loading module details...</div>;

  const { module, assigned_at, due_date, completed_at, status } = assignment;

  const tabConfig = [
    {
      key: "overview",
      label: "Overview",
      icon: <FiBookOpen />,
      content: (
        <div className="text-sm text-gray-700 space-y-4">
          <p><strong>Description:</strong> {module.description || "No description provided."}</p>
          <p><strong>Assigned:</strong> {new Date(assigned_at).toLocaleString()}</p>
          <p><strong>Due:</strong> {due_date ? new Date(due_date).toLocaleString() : "—"}</p>
          <p><strong>Completed:</strong> {completed_at ? new Date(completed_at).toLocaleString() : "—"}</p>
          <p><strong>Status:</strong> {status}</p>
        </div>
      ),
    },
  ];

  return (
    <DetailsPage
      title={module.name}
      breadcrumbs={[
        {
          label: "My Modules",
          onClick: () => {
            clearSelectedEntity();
            setMainPage("mymodules");
          },
        },
        { label: module.name },
      ]}
      tabs={tabConfig}
    />
  );
}
