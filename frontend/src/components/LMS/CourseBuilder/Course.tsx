import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";
import CourseRow from "./CourseRow";
import CourseCreate from "../CourseCreate";

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

interface CourseProps {
  setMainPage: (page: string) => void;
}

export default function Course({ setMainPage }: CourseProps) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();

  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/courses/`, {
        params: { org_id: user?.organisation?.id },
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Delete this course?");
    if (confirmed) {
      try {
        await axios.delete(`${BACKEND_URL}/courses/${id}`, {
          params: { org_id: user?.organisation?.id },
        });
        fetchCourses();
      } catch (err) {
        console.error("Error deleting course:", err);
      }
    }
  };

  const handleSelect = (id: string | number) => {
    setSelectedEntity({ type: "course", id });
    setMainPage("coursedetails");
  };

  const handleAddClick = () => {
    setShowModal(true);
  };

  const handleEditClick = () => {
    setShowModal(true);
  };

  const renderRow = (
    course: Course,
    _openDropdown: string | number | null,
    _setDropdownOpen: (id: string | number | null) => void,
    _openEditModal: (item: Course) => void
  ) => (
    <CourseRow
      course={course}
      onClick={() => handleSelect(course.id)}
      onEdit={handleEditClick}
      onDelete={handleDelete}
    />
  );

  return (
    <>
      <LearnListPage<Course>
        title="Courses"
        entityType="course"
        items={courses}
        onFetch={fetchCourses}
        onSelect={handleSelect}
        renderRow={renderRow}
        columns={["Title", "Description", "Slides", "Created", "Actions"]}
        addButtonLabel="Add"
        showSearchBar={true}
        onAddClick={handleAddClick}
      />

      <CourseCreate
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreated={fetchCourses}
      />
    </>
  );
}
