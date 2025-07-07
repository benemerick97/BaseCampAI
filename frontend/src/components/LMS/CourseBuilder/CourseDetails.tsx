// frontend/src/components/LMS/CourseBuilder/CourseDetails.tsx

import { useEffect, useState } from "react";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import { useAuth } from "../../../contexts/AuthContext";
import { FiBookOpen, FiUsers, FiEdit2 } from "react-icons/fi";
import DetailsPage from "../../Shared/DetailsPage";

interface Course {
  id: string;
  name: string;
  description?: string;
  org_id: number;
  document_id: string;
  slides: { title: string; bullets: string[] }[];
  created_at: string;
}

export default function CourseDetails({ setMainPage }: { setMainPage: (p: string) => void }) {
  const { selectedEntity, clearSelectedEntity, setSelectedEntity } = useSelectedEntity();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!selectedEntity || selectedEntity.type !== "course") return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/courses/${selectedEntity.id}`
        );
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error("Error loading course:", err);
      }
    };

    fetchCourse();
  }, [selectedEntity]);

  if (!course) return <div className="p-6">Loading course details...</div>;

  return (
    <DetailsPage
      title={course.name}
      breadcrumbs={[
        {
          label: "Courses",
          onClick: () => {
            clearSelectedEntity();
            setMainPage("course");
          },
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
                  setSelectedEntity({ type: "course", id: course.id, data: course });
                  setMainPage("courselearn");
                }}
              >
                Start Learning
              </button>
            </div>
          ),
        },
        {
          key: "students",
          label: "Enrolled",
          icon: <FiUsers />,
          content: <p className="text-sm text-gray-600">No students enrolled yet.</p>,
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
