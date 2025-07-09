// frontend/src/components/LMS/ModuleBuilder/ModuleDetails.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import { FiBookOpen, FiEdit2 } from "react-icons/fi";
import DetailsPage from "../../Shared/DetailsPage";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface Module {
  id: string;
  name: string;
  description?: string;
  org_id: number;
  created_at: string;
}

interface ModuleDetailsProps {
  setMainPage: (page: string) => void;
}

export default function ModuleDetails({ setMainPage }: ModuleDetailsProps) {
  const { user } = useAuth();
  const { selectedEntity, clearSelectedEntity } = useSelectedEntity();
  const [module, setModule] = useState<Module | null>(null);

  useEffect(() => {
    if (!selectedEntity || selectedEntity.type !== "module") return;

    axios
      .get(`${BACKEND_URL}/learn/modules/${selectedEntity.id}`, {
        params: { organisation_id: user?.organisation?.id },
      })
      .then((res) => setModule(res.data))
      .catch((err) => console.error("Error loading module details:", err));
  }, [selectedEntity]);

  if (!module) return <div className="p-6">Loading module details...</div>;

  const tabConfig = [
    {
      key: "overview",
      label: "Overview",
      icon: <FiBookOpen />,
      content: (
        <div className="text-sm text-gray-700 space-y-4">
          <p><strong>Description:</strong> {module.description || "No description provided."}</p>
          <p><strong>Created:</strong> {new Date(module.created_at).toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <FiEdit2 />,
      content: <p className="text-sm text-gray-500">Edit coming soon...</p>,
    },
  ];

  return (
    <DetailsPage
      title={module.name}
      breadcrumbs={[
        {
          label: "Modules",
          onClick: () => {
            clearSelectedEntity();
            setMainPage("module");
          },
        },
        { label: module.name },
      ]}
      tabs={tabConfig}
    />
  );
}
