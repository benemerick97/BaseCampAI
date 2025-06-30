// src/hooks/useOrganisations.ts
import { useEffect, useState, useCallback } from "react";

interface Organisation {
  id: number;
  name: string;
  short_name?: string;
}

export function useOrganisations(enabled: boolean) {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const fetchOrganisations = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/superadmin/organisations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch organisations");

      const data = await response.json();
      setOrganisations(data);
    } catch (err) {
      console.error("Organisation fetch error:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  return { organisations, loading, error, refetch: fetchOrganisations };
}
