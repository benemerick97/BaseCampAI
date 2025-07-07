// frontend/src/components/LMS/CourseBuilder/CourseCreate.tsx

import { useEffect, useState } from "react";
import EntityModal from "./LearnModal";
import { useAuth } from "../../contexts/AuthContext";

interface DocumentOption {
  id: string;
  name: string;
}

interface CourseFormData {
  name?: string;
  description?: string;
  document_id?: string;
}

interface CourseCreateProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  existingCourse?: CourseFormData & { id?: string };
}

export default function CourseCreate({
  visible,
  onClose,
  onCreated,
  existingCourse,
}: CourseCreateProps) {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const [formData, setFormData] = useState<CourseFormData>({});
  const [documents, setDocuments] = useState<DocumentOption[]>([]);

  useEffect(() => {
    if (visible && orgId) {
      fetchDocuments();

      if (existingCourse) {
        setFormData({
          name: existingCourse.name,
          description: existingCourse.description,
          document_id: existingCourse.document_id,
        });
      } else {
        setFormData({});
      }
    }
  }, [visible, orgId, existingCourse]);

  const fetchDocuments = async () => {
    try {
      if (!orgId) {
        console.error("❌ No organisation ID available");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/document-objects`, {
        headers: {
          "Content-Type": "application/json",
          "x-org-id": orgId,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    if (key === "document_id") {
      const selectedDoc = documents.find((doc) => doc.id === value);

      setFormData((prev) => {
        const updated: CourseFormData = { ...prev, document_id: value };

        if (!prev.name && selectedDoc?.name) {
          updated.name = selectedDoc.name.replace(/\.[^/.]+$/, ""); // remove extension
        }

        return updated;
      });
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = async (data: CourseFormData) => {
    try {
      if (!orgId) {
        console.error("❌ No organisation selected");
        return;
      }

      const isEditing = !!existingCourse?.id;
      const endpoint = isEditing
        ? `${import.meta.env.VITE_API_URL}/courses/${existingCourse.id}`
        : `${import.meta.env.VITE_API_URL}/courses/`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-org-id": orgId,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Failed to ${isEditing ? "update" : "create"} course: ${res.status} ${errorBody}`);
      }

      setFormData({});
      onCreated();
      onClose();
    } catch (err) {
      console.error("Error submitting course:", err);
    }
  };

  return (
    <EntityModal
      title={existingCourse ? "Edit Course" : "Create Course"}
      visible={visible}
      onClose={() => {
        setFormData({});
        onClose();
      }}
      onSubmit={handleSubmit}
      formData={formData}
      setFormData={setFormData}
      onFieldChange={handleFieldChange}
      fields={[
        {
          label: "Document",
          key: "document_id",
          type: "select",
          options: documents.map((doc) => ({
            label: doc.name,
            value: doc.id,
          })),
        },
        { label: "Course Name", key: "name" },
        { label: "Description", key: "description" },
      ]}
    />
  );
}
