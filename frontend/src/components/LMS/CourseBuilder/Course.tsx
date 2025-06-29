import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";
import CourseRow from "./CourseRow";
import EntityModal from "../LearnModal";

interface Course {
  id: number;
  title: string;
  category?: string;
  duration?: string;
  created_date: string;
  organisation_id: number;
}

interface CourseProps {
  setMainPage: (page: string) => void;
}

export default function Course({ setMainPage }: CourseProps) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();

  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const fetchCourses = async () => {
    try {
      const response = await axios.get("https://basecampai.ngrok.io/courses/", {
        params: { organisation_id: user?.organisation?.id },
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddOrEditCourse = async (form: any) => {
    const payload = {
      title: form.title,
      category: form.category,
      duration: form.duration,
      organisation_id: user?.organisation?.id,
    };

    if (form.id) {
      await axios.put(`https://basecampai.ngrok.io/courses/${form.id}`, payload);
    } else {
      await axios.post("https://basecampai.ngrok.io/courses/", payload);
    }

    setShowModal(false);
    setFormData({});
    fetchCourses();
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Delete this course?");
    if (confirmed) {
      await axios.delete(`https://basecampai.ngrok.io/courses/${id}`, {
        params: { organisation_id: user?.organisation?.id },
      });
      fetchCourses();
    }
  };

  const handleSelect = (id: number) => {
    setSelectedEntity({ type: "course", id });
    setMainPage("coursedetails");
  };

  const handleAddClick = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleEditClick = (course: Course) => {
    setFormData(course);
    setShowModal(true);
  };

  const renderRow = (
    course: Course,
    _openDropdown: number | null,
    _setOpenDropdown: (id: number | null) => void,
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
        columns={["Title", "Category", "Duration", "Created", "Actions"]}
        addButtonLabel="Add"
        showSearchBar={true}
        onAddClick={handleAddClick}
      />

      <EntityModal
        title="Course"
        visible={showModal}
        onClose={() => {
          setFormData({});
          setShowModal(false);
        }}
        onSubmit={handleAddOrEditCourse}
        formData={formData}
        setFormData={setFormData}
        fields={[
          { label: "Title", key: "title" },
          { label: "Category", key: "category" },
          { label: "Duration", key: "duration" },
        ]}
      />
    </>
  );
}
