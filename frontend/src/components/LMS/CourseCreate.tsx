// frontend/src/components/LMS/CourseBuilder/CourseCreate.tsx

import { useEffect, useState } from "react";
import EntityModal from "./LearnModal";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/axiosInstance";

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

      const res = await api.get("/document-objects", {
        headers: { "x-org-id": orgId },
      });

      setDocuments(res.data || []);
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
        ? `/courses/${existingCourse.id}`
        : `/courses/`;
      const method = isEditing ? "put" : "post";

      await api.request({
        method,
        url: endpoint,
        headers: {
          "x-org-id": orgId,
        },
        data,
      });

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
