import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL = "https://basecampai.ngrok.io/custom-fields/";

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
 // entityId,
  organisationId,
}: UseCustomFieldsProps) {
  const { token } = useAuth();

  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    "Content-Type": "application/json",
    "x-org-id": organisationId.toString(),
    Authorization: `Bearer ${token}`,
  };

  const fetchFields = async () => {
    try {
      const url = `${BASE_URL}?entity_type=${entityType}`;
      console.log("Fetching custom fields from:", url);

      const res = await fetch(url, { headers });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error response:", text);
        throw new Error("Failed to fetch custom fields");
      }

      const data = await res.json();
      console.log("Fetched custom fields:", data);
      setFields(data);
    } catch (err: any) {
      console.error("Error fetching fields:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createField = async (fieldData: CustomFieldCreateInput) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(fieldData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to create custom field");
    }

    const newField = await res.json();
    setFields((prev) => [...prev, newField]);
  };

  const deleteField = async (fieldId: number) => {
    const res = await fetch(`${BASE_URL}${fieldId}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to delete custom field");
    }

    setFields((prev) => prev.filter((f) => f.id !== fieldId));
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
