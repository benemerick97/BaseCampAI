// /frontend/src/hooks/useCustomFieldValues.ts

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/axiosInstance";

interface FieldValue {
  id: number;
  custom_field_id: number;
  entity_id: number;
  value_text: string;
}

interface UseCustomFieldValuesProps {
  entityId: number;
}

export function useCustomFieldValues({ entityId }: UseCustomFieldValuesProps) {
  const { user } = useAuth(); // ✅ Get user context
  const [values, setValues] = useState<FieldValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    "x-org-id": user?.organisation?.id?.toString() || "",
  };

  const fetchValues = async () => {
    try {
      const res = await api.get(`/custom-field-values/entity/${entityId}`, {
        headers,
      });
      setValues(res.data);
    } catch (err: any) {
      console.error("Error fetching custom field values:", err);
      setError(err.response?.data?.detail || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const saveValue = async (fieldId: number, value: string) => {
    const existing = values.find((v) => v.custom_field_id === fieldId);
    try {
      if (existing) {
        const res = await api.put(
          `/custom-field-value/${existing.id}`,
          { value_text: value },
          { headers }
        );
        setValues((prev) =>
          prev.map((v) => (v.id === res.data.id ? res.data : v))
        );
      } else {
        const res = await api.post(
          `/custom-field-value/`,
          {
            custom_field_id: fieldId,
            entity_id: entityId,
            value_text: value,
          },
          { headers }
        );
        setValues((prev) => [...prev, res.data]);
      }
    } catch (err: any) {
      console.error("Error saving custom field value:", err);
      throw new Error(err.response?.data?.detail || err.message || "Save failed");
    }
  };

  useEffect(() => {
    fetchValues();
  }, [entityId]);

  return {
    values,
    loading,
    error,
    saveValue,
    refresh: fetchValues,
  };
}
