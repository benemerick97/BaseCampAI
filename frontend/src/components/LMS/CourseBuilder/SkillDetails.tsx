// frontend/src/components/LMS/SkillBuilder/SkillDetails.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import { FiBookOpen, FiUsers, FiEdit2 } from "react-icons/fi";
import DetailsPage from "../../Shared/DetailsPage";
import AssignedUsersTab from "./Tabs/AssignedUsersTab";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface Skill {
  id: string;
  name: string;
  description?: string;
  evidence_required: boolean;
  org_id: number;
  document_id?: string;
  created_at: string;
}

interface SkillDetailsProps {
  setMainPage: (page: string) => void;
}

export default function SkillDetails({ setMainPage }: SkillDetailsProps) {
  const { user } = useAuth();
  const { selectedEntity, clearSelectedEntity, setSelectedEntity } = useSelectedEntity();
  const [skill, setSkill] = useState<Skill | null>(null);

  useEffect(() => {
    if (!selectedEntity || selectedEntity.type !== "skill") return;

    axios
      .get(`${BACKEND_URL}/skills/${selectedEntity.id}`, {
        params: { organisation_id: user?.organisation?.id },
      })
      .then((res) => setSkill(res.data))
      .catch((err) => console.error("Error loading skill details:", err));
  }, [selectedEntity]);

  if (!skill) return <div className="p-6">Loading skill details...</div>;

  const tabConfig = [
    {
      key: "overview",
      label: "Overview",
      icon: <FiBookOpen />,
      content: (
        <div className="text-sm text-gray-700 space-y-4">
          <p><strong>Description:</strong> {skill.description || "No description provided."}</p>
          <p><strong>Evidence Required:</strong> {skill.evidence_required ? "Yes" : "No"}</p>

          {skill.evidence_required ? (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setSelectedEntity({ type: "skill", id: skill.id, data: skill });
                setMainPage("skillevidenceupload");
              }}
            >
              Upload Evidence
            </button>
          ) : (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={async () => {
                try {
                  await axios.post(`${BACKEND_URL}/learn/complete-skill`, {
                    user_id: user?.id,
                    skill_id: skill.id,
                  });
                  alert("Skill marked complete");
                  setMainPage("myskills");
                } catch (err) {
                  console.error("Failed to mark skill complete:", err);
                }
              }}
            >
              Mark Complete
            </button>
          )}
        </div>
      ),
    },
    {
      key: "assigned",
      label: "Assigned",
      icon: <FiUsers />,
      content: <AssignedUsersTab id={skill.id} type="skill" setMainPage={setMainPage} />,
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
      title={skill.name}
      breadcrumbs={[
        {
          label: "Modules",
          onClick: () => {
            clearSelectedEntity();
            setMainPage("module");
          },
        },
        {
          label: "Courses",
          onClick: () => {
            clearSelectedEntity();
            setMainPage("course");
          },
        },          
        {
          label: "Skills",
          onClick: () => {
            clearSelectedEntity();
            setMainPage("skill");
          },
        },
        { label: skill.name },
      ]}
      tabs={tabConfig}
    />
  );
}
