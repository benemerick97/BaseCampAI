// frontend/src/components/LMS/CourseBuilder/CourseDetails.tsx

import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import { FiBookOpen, FiUsers, FiEdit2 } from "react-icons/fi";
import DetailsPage from "../../Shared/DetailsPage";
import AssignedUsersTab from "./Tabs/AssignedUsersTab";
import UserDetails from "../../OrgAdmin/UserDetails.tsx";

interface Course {
  id: string;
  name: string;
  description?: string;
  org_id: number;
  document_id: string;
  slides: { title: string; bullets: string[] }[];
  created_at: string;
}

interface CourseDetailsProps {
  id: string;
  onBack: () => void;
}

export default function CourseDetails({ id, onBack }: CourseDetailsProps) {
  useAuth();
  const { selectedEntity } = useSelectedEntity();
  const [course, setCourse] = useState<Course | null>(null);
  const [subPage, setSubPage] = useState<"details" | "coursedetails" | "skilldetails" | "userdetails">("details");

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/courses/${id}`);
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error("Error loading course:", err);
      }
    };

    fetchCourse();
  }, [id]);

  if (!course) return <div className="p-6">Loading course details...</div>;

  if (subPage === "userdetails") {
    return (
      <UserDetails
        id={String(selectedEntity?.id ?? "")}
        onBack={() => setSubPage("details")}
      />
    );
  }

  return (
    <DetailsPage
      title={course.name}
      breadcrumbs={[
        {
          label: "Back to Module",
          onClick: onBack,
        },
        { label: course.name },
      ]}
      tabs={[
        {
          key: "overview",
          label: "Overview",
          icon: <FiBookOpen />,
          content: (
            <div className="text-sm text-gray-700 space-y-4">
              <p><strong>Description:</strong> {course.description || "No description provided."}</p>
              <p><strong>Slides:</strong> {course.slides?.length || 0} slides</p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  console.log("Start learning");
                }}
              >
                Start Learning
              </button>
            </div>
          ),
        },
        {
          key: "assigned",
          label: "Assigned",
          icon: <FiUsers />,
          content: <AssignedUsersTab id={course.id} type="course" setMainPage={setSubPage} />,
        },
        {
          key: "edit",
          label: "Edit",
          icon: <FiEdit2 />,
          content: <p className="text-sm text-gray-500">Edit coming soon...</p>,
        },
      ]}
    />
  );
}
