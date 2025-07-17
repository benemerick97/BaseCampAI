// frontend/src/components/LMS/MyCourses.tsx

import { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";
import CourseRow from "../CourseBuilder/CourseRow";


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
  const [statusFilter, setStatusFilter] = useState<"assigned" | "completed" | "all">("assigned");
  const [searchTerm, setSearchTerm] = useState("");
  const [showExtraFilters, setShowExtraFilters] = useState(false);

  const fetchAssignments = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/learn/assigned-courses`, {
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
        onClick={assignment.status === "completed" ? () => {} : () => handleSelect(course)}
        onEdit={() => {}}
        onDelete={() => {}}
        setMainPage={setMainPage}
        hideAdminActions={true}
        showStatus={assignment.status}
        assignedAt={assignment.assigned_at}
        dueDate={assignment.due_date}
        completedAt={assignment.completed_at}
      />
    );
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "assigned" && (a.status === "assigned" || a.status === "overdue")) ||
      (statusFilter === "completed" && (a.status === "completed" || a.status === "expired"));

    const matchesSearch =
      !searchTerm ||
      a.course?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.course?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const headerContent = (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search your courses"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full sm:w-auto flex-grow sm:flex-none"
        />

        {/* Group +Add Filter and Status buttons side-by-side */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowExtraFilters((prev) => !prev)}
            className="text-sm text-blue-600 font-medium hover:underline border px-3 py-1.5 rounded"
          >
            + Add filter
          </button>

          {/* ✅ Status Filter Buttons beside Add Filter */}
          {["assigned", "completed", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as "assigned" | "completed" | "all")}
              className={`px-3 py-1.5 rounded text-sm font-medium border ${
                statusFilter === status
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {showExtraFilters && (
        <div className="bg-gray-50 border border-gray-200 p-3 rounded text-sm text-gray-600">
          <p className="mb-1 font-medium">Additional filters coming soon!</p>
          <ul className="list-disc pl-5 text-xs text-gray-500">
            <li>Date ranges</li>
            <li>Status toggles</li>
            <li>Course tags</li>
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <LearnListPage<AssignedCourse>
      title="My Courses"
      entityType="assignment"
      items={filteredAssignments}
      onFetch={fetchAssignments}
      onSelect={() => {}}
      renderRow={renderRow}
      hideAddButton={true}
      columns={["Title", "Description", "Assigned", "Due", "Completed", "Status", "Actions"]}
      showSearchBar={false} // handled via headerContent
      headerContent={headerContent}
    />
  );
}
