// /workspaces/BaseCampAI/frontend/src/hooks/useCustomFields.ts

import { useState, useEffect } from "react";
import api from "../utils/axiosInstance";

interface UseCustomFieldsProps {
  entityType: string;
  entityId: number;
  organisationId: number;
}

interface CustomFieldCreateInput {
  name: string;
  field_type: string;
  entity_type: string;
  organisation_id: number;
  is_required?: boolean;
}

export function useCustomFields({
  entityType,
  organisationId,
}: UseCustomFieldsProps) {
  
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    "x-org-id": organisationId.toString(),
  };

  const fetchFields = async () => {
    try {
      const res = await api.get(`/custom-fields`, {
        headers,
        params: { entity_type: entityType },
      });

      setFields(res.data);
    } catch (err: any) {
      console.error("Error fetching fields:", err);
      setError(err.response?.data?.detail || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createField = async (fieldData: CustomFieldCreateInput) => {
    try {
      const res = await api.post("/custom-fields", fieldData, { headers });
      setFields((prev) => [...prev, res.data]);
    } catch (err: any) {
      console.error("Error creating field:", err);
      throw new Error(err.response?.data?.detail || "Failed to create custom field");
    }
  };

  const deleteField = async (fieldId: number) => {
    try {
      await api.delete(`/custom-fields/${fieldId}`, { headers });
      setFields((prev) => prev.filter((f) => f.id !== fieldId));
    } catch (err: any) {
      console.error("Error deleting field:", err);
      throw new Error(err.response?.data?.detail || "Failed to delete custom field");
    }
  };

  useEffect(() => {
    fetchFields();
  }, [entityType, organisationId]);

  return {
    fields,
    loading,
    error,
    createField,
    deleteField,
    refresh: fetchFields,
  };
}
