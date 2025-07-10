// frontend/src/components/LMS/SkillBuilder/SkillDetails.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import { FiBookOpen, FiUsers, FiEdit2 } from "react-icons/fi";
import DetailsPage from "../../Shared/DetailsPage";
import AssignedUsersTab from "./Tabs/AssignedUsersTab";
import UserDetails from "../../OrgAdmin/UserDetails";

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
  id: string;
  onBack: () => void;
}

export default function SkillDetails({ id, onBack }: SkillDetailsProps) {
  const { user } = useAuth();
  const { selectedEntity } = useSelectedEntity();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [subPage, setSubPage] = useState<"details" | "coursedetails" | "skilldetails" | "userdetails">("details");

  useEffect(() => {
    if (!id) return;

    axios
      .get(`${BACKEND_URL}/skills/${id}`, {
        params: { organisation_id: user?.organisation?.id },
      })
      .then((res) => setSkill(res.data))
      .catch((err) => console.error("Error loading skill details:", err));
  }, [id]);

  if (!skill) return <div className="p-6">Loading skill details...</div>;

  // ✅ Show user details if subPage = "userdetails"
  if (subPage === "userdetails") {
    return (
      <UserDetails
        id={String(selectedEntity?.id ?? "")}
        onBack={() => setSubPage("details")}
      />
    );
  }

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
                console.log("Upload evidence clicked");
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
                  onBack();
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
      content: (
        <AssignedUsersTab id={skill.id} type="skill" setMainPage={setSubPage} />
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
      title={skill.name}
      breadcrumbs={[
        {
          label: "Back to Module",
          onClick: onBack,
        },
        { label: skill.name },
      ]}
      tabs={tabConfig}
    />
  );
}
