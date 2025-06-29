
import { FiInfo, FiUsers, FiEdit2 } from "react-icons/fi";
import DetailsPage from "../../Shared/DetailsPage"; // adjust import if needed

interface Skill {
  id: number;
  name: string;
  category?: string;
  description?: string;
  created_date: string;
  organisation_id: number;
}

export default function SkillDetails({ skill }: { skill: Skill }) {
  return (
    <DetailsPage
      title={skill?.name || "Skill Details"}
      breadcrumbs={[
        { label: "Learning", onClick: () => {/* navigate to LMS home */} },
        { label: "Skills", onClick: () => {/* navigate to Skills list */} },
        { label: skill?.name || "Skill" },
      ]}
      tabs={[
        {
          key: "overview",
          label: "Overview",
          icon: <FiInfo />,
          content: (
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Category:</strong> {skill.category || "—"}</p>
              <p><strong>Description:</strong> {skill.description || "No description provided."}</p>
              <p><strong>Created:</strong> {new Date(skill.created_date).toLocaleDateString()}</p>
            </div>
          ),
        },
        {
          key: "linked-users",
          label: "Users",
          icon: <FiUsers />,
          content: (
            <div className="text-sm text-gray-700">
              <p>No users assigned to this skill yet.</p>
              {/* Future: map over users with this skill */}
            </div>
          ),
        },
        {
          key: "edit",
          label: "Edit",
          icon: <FiEdit2 />,
          content: (
            <div className="text-sm text-gray-700">
              <p>Editing functionality coming soon...</p>
              {/* You can embed a small form or modal trigger here if needed */}
            </div>
          ),
        },
      ]}
    />
  );
}
