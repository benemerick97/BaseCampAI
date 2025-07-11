// frontend/src/components/LMS/CourseBuilder/Course.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";
import CourseRow from "./CourseRow";
import CourseCreate from "../CourseCreate";



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
  const { user, token } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  const orgId = user?.organisation?.id;
  const queryKey = ["courses", orgId];

  const {
    data: courses = [],
    isLoading,
  } = useQuery<Course[]>({
    queryKey,
    queryFn: async () => {
      const res = await api.get("/courses/", {
        params: { org_id: orgId },
        headers: {
          Authorization: `Bearer ${token!}`,
        },
      });
      return res.data;
    },
    enabled: !!orgId && !!token,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/courses/${id}`, {
        headers: {
          "x-org-id": orgId?.toString() || "",
          Authorization: `Bearer ${token!}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      console.error("Error deleting course:", err);
    },
  });

  const handleDelete = (id: string) => {
    const confirmed = confirm("Delete this course?");
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const handleSelect = (id: string | number) => {
    setSelectedEntity({ type: "course", id });
    setMainPage("coursedetails");
  };

  const handleAddClick = () => {
    setEditCourse(null);
    setShowModal(true);
  };

  const handleEditClick = (course: Course) => {
    setEditCourse(course);
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
      onEdit={() => handleEditClick(course)}
      onDelete={handleDelete}
      setMainPage={setMainPage}
      hideAdminActions={false}
    />
  );

  return (
    <>
      <LearnListPage<Course>
        title="Courses"
        entityType="course"
        items={courses}
        onFetch={() => queryClient.invalidateQueries({ queryKey })}
        onSelect={handleSelect}
        renderRow={renderRow}
        columns={["Title", "Description", "Slides", "Created", "Actions"]}
        addButtonLabel="Add"
        showSearchBar={true}
        onAddClick={handleAddClick}
        isLoading={isLoading} // ✅ optional if you’ve added it to LearnListPageProps
      />

      <CourseCreate
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditCourse(null);
        }}
        onCreated={() => queryClient.invalidateQueries({ queryKey })}
        existingCourse={editCourse ?? undefined}
      />
    </>
  );
}
