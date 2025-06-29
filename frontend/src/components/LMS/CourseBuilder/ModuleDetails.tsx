
import { FiBook, FiFileText, FiEdit2 } from "react-icons/fi";
import DetailsPage from "../../Shared/DetailsPage"; // Adjust if your DetailsPage is elsewhere

interface Module {
  id: number;
  title: string;
  description?: string;
  created_date: string;
  organisation_id: number;
}

export default function ModuleDetails({ module }: { module: Module }) {
  return (
    <DetailsPage
      title={module?.title || "Module Details"}
      breadcrumbs={[
        { label: "Learning", onClick: () => {/* navigate to LMS home */} },
        { label: "Modules", onClick: () => {/* navigate to Modules list */} },
        { label: module?.title || "Module" },
      ]}
      tabs={[
        {
          key: "overview",
          label: "Overview",
          icon: <FiBook />,
          content: (
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Description:</strong> {module.description || "No description provided."}</p>
              <p><strong>Created:</strong> {new Date(module.created_date).toLocaleDateString()}</p>
            </div>
          ),
        },
        {
          key: "lessons",
          label: "Lessons",
          icon: <FiFileText />,
          content: (
            <div className="text-sm text-gray-700">
              <p>No lessons linked to this module yet.</p>
              {/* Later: display linked lessons here */}
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
            </div>
          ),
        },
      ]}
    />
  );
}
