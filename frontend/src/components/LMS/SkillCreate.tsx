// frontend/src/components/LMS/SkillCreate.tsx

import { useEffect, useState } from "react";
import EntityModal from "./LearnModal";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/axiosInstance";

interface DocumentOption {
  id: string;
  name: string;
}

interface SkillFormData {
  name?: string;
  description?: string;
  document_id?: string;
  evidence_required?: boolean;
}

interface SkillCreateProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  existingSkill?: SkillFormData & { id?: string };
}

export default function SkillCreate({
  visible,
  onClose,
  onCreated,
  existingSkill,
}: SkillCreateProps) {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const [formData, setFormData] = useState<SkillFormData>({});
  const [documents, setDocuments] = useState<DocumentOption[]>([]);

  useEffect(() => {
    if (visible && orgId) {
      fetchDocuments();

      if (existingSkill) {
        setFormData({
          name: existingSkill.name,
          description: existingSkill.description,
          document_id: existingSkill.document_id,
          evidence_required: existingSkill.evidence_required ?? false,
        });
      } else {
        setFormData({ evidence_required: false });
      }
    }
  }, [visible, orgId, existingSkill]);

  const fetchDocuments = async () => {
    try {
      if (!orgId) return;

      const res = await api.get("/document-objects", {
        headers: {
          "x-org-id": orgId,
        },
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
        const updated: SkillFormData = { ...prev, document_id: value };
        if (!prev.name && selectedDoc?.name) {
          updated.name = selectedDoc.name.replace(/\.[^/.]+$/, ""); // Remove extension
        }
        return updated;
      });
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = async (data: SkillFormData) => {
    try {
      if (!orgId) return;

      const isEditing = !!existingSkill?.id;
      const endpoint = isEditing ? `/skills/${existingSkill.id}` : `/skills/`;
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
      console.error("Error submitting skill:", err);
    }
  };

  return (
    <EntityModal
      title={existingSkill ? "Edit Skill" : "Create Skill"}
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
          label: "Document (optional)",
          key: "document_id",
          type: "select",
          options: documents.map((doc) => ({
            label: doc.name,
            value: doc.id,
          })),
        },
        { label: "Skill Name", key: "name" },
        { label: "Description", key: "description" },
        {
          label: "Evidence Required?",
          key: "evidence_required",
          type: "select",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      ]}
    />
  );
}
