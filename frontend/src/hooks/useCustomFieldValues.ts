import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL;

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
  const { token, user } = useAuth();

  const [values, setValues] = useState<FieldValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "x-org-id": user?.organisation?.id?.toString() || "", // Optional, used if backend respects it
  };

  const fetchValues = async () => {
    try {
      console.log("Fetching custom field values for entity:", entityId);
      const res = await fetch(`${BASE_URL}/custom-field-values/entity/${entityId}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch custom field values");

      const data = await res.json();
      console.log("Received field values:", data); // Debugging line
      setValues(data);
    } catch (err: any) {
      console.error("Error fetching custom field values:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const saveValue = async (fieldId: number, value: string) => {
    const existing = values.find((v) => v.custom_field_id === fieldId);
    try {
      if (existing) {
        // Update
        const res = await fetch(`${BASE_URL}/custom-field-value/${existing.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ value_text: value }),
        });
        if (!res.ok) throw new Error("Failed to update field value");
        const updated = await res.json();
        setValues((prev) =>
          prev.map((v) => (v.id === updated.id ? updated : v))
        );
      } else {
        // Create
        const res = await fetch(`${BASE_URL}/custom-field-value/`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            custom_field_id: fieldId,
            entity_id: entityId,
            value_text: value,
          }),
        });
        if (!res.ok) throw new Error("Failed to create field value");
        const created = await res.json();
        setValues((prev) => [...prev, created]);
      }
    } catch (err: any) {
      console.error("Error saving custom field value:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchValues();
  }, [entityId]);

  return { values, loading, error, saveValue, refresh: fetchValues };
}
