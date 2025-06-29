
import { FiBookOpen, FiUsers, FiEdit2 } from "react-icons/fi";
import DetailsPage from "../../Shared/DetailsPage"; 
export default function CourseDetails({ course }: { course: any }) {
  return (
    <DetailsPage
      title={course?.title || "Course Details"}
      breadcrumbs={[
        { label: "Learning", onClick: () => {/* navigate to LMS home */} },
        { label: "Courses", onClick: () => {/* navigate to course list */} },
        { label: course?.title || "Course" },
      ]}
      tabs={[
        {
          key: "overview",
          label: "Overview",
          icon: <FiBookOpen />,
          content: (
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Category:</strong> {course.category || "—"}</p>
              <p><strong>Duration:</strong> {course.duration || "—"}</p>
              <p><strong>Description:</strong> {course.description || "No description available."}</p>
            </div>
          ),
        },
        {
          key: "students",
          label: "Enrolled",
          icon: <FiUsers />,
          content: (
            <div className="text-sm text-gray-700">
              {/* Replace with list of enrolled users */}
              <p>No students enrolled yet.</p>
            </div>
          ),
        },
        {
          key: "edit",
          label: "Edit",
          icon: <FiEdit2 />,
          content: (
            <div>
              {/* You can put an inline edit form or reuse the modal in static mode */}
              <p>Edit coming soon...</p>
            </div>
          ),
        },
      ]}
    />
  );
}
