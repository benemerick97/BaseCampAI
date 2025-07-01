// frontend/src/components/LMS/CourseBuilder/CourseCreate.tsx

import { useEffect, useState } from "react";
import EntityModal from "./LearnModal";
import { useAuth } from "../../contexts/AuthContext";


interface DocumentOption {
  id: string;
  name: string;
}

interface CourseCreateProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CourseCreate({
  visible,
  onClose,
  onCreated,
}: CourseCreateProps) {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [documents, setDocuments] = useState<DocumentOption[]>([]);

  useEffect(() => {
    if (visible && orgId) {
      fetchDocuments();
    }
  }, [visible, orgId]);

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

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (!orgId) {
        console.error("❌ No organisation selected");
        return;
      }

      const payload = {
        ...data,
        org_id: orgId,
      };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/courses/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Failed to create course: ${res.status} ${errorBody}`);
      }

      setFormData({});
      onCreated();
      onClose();
    } catch (err) {
      console.error("Error creating course:", err);
    }
  };

  return (
    <EntityModal
      title="Course"
      visible={visible}
      onClose={() => {
        setFormData({});
        onClose();
      }}
      onSubmit={handleSubmit}
      formData={formData}
      setFormData={setFormData}
      fields={[
        { label: "Course Name", key: "name" },
        { label: "Description", key: "description" },
        {
          label: "Document",
          key: "document_id",
          type: "select",
          options: documents.map((doc) => ({
            label: doc.name,
            value: doc.id,
          })),
        },
      ]}
    />
  );
}
