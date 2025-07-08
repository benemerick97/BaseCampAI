// frontend/src/components/LMS/MyCourses.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";
import CourseRow from "../CourseBuilder/CourseRow";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface Course {
  id: string;
  name: string;
  description?: string;
  org_id: number;
  document_id: string;
  slides: any[];
  created_at: string;
}

interface AssignedCourse {
  id: string;
  user_id: number;
  course_id: string;
  assigned_by: number;
  due_date?: string;
  status: string;
  assigned_at: string;
  completed_at?: string;
  course: Course | undefined;
}

interface MyCoursesProps {
  setMainPage: (page: string) => void;
}

export default function MyCourses({ setMainPage }: MyCoursesProps) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();
  const [assignments, setAssignments] = useState<AssignedCourse[]>([]);

  const fetchAssignments = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/learn/assigned-courses`, {
        params: { user_id: user.id },
      });
      setAssignments(res.data);
    } catch (err) {
      console.error("Failed to fetch assigned courses:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAssignments();
    }
  }, [user]);

  const handleSelect = (course: Course) => {
    setSelectedEntity({ type: "course", id: course.id, data: course });
    setMainPage("courselearn");
  };

  const renderRow = (
    assignment: AssignedCourse,
    _openDropdown: string | number | null,
    _setDropdownOpen: (id: string | number | null) => void,
    _openEditModal: (item: AssignedCourse) => void
  ) => {
    const course = assignment.course;

    if (!course || !course.id || !course.name) {
      console.warn("⚠️ Skipping invalid course assignment:", assignment);
      return null;
    }

    return (
      <CourseRow
        course={course}
        onClick={() => handleSelect(course)}
        onEdit={() => {}}
        onDelete={() => {}}
        setMainPage={setMainPage}
        hideAdminActions={true}
        showStatus={assignment.status}
        assignedAt={assignment.assigned_at}
        dueDate={assignment.due_date}
      />
    );
  };

  return (
    <LearnListPage<AssignedCourse>
      title="My Courses"
      entityType="assignment"
      items={assignments}
      onFetch={fetchAssignments}
      onSelect={() => {}}
      renderRow={renderRow}
      columns={["Title", "Description", "Assigned", "Due", "Status", "Actions"]}
      showSearchBar={true}
    />
  );
}
