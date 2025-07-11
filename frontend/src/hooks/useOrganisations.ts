// src/hooks/useOrganisations.ts

import { useEffect, useState, useCallback } from "react";
import api from "../utils/axiosInstance"; // ✅ Import axios instance

interface Organisation {
  id: number;
  name: string;
  short_name?: string;
}

export function useOrganisations(enabled: boolean) {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganisations = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/superadmin/organisations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrganisations(response.data);
    } catch (err: any) {
      console.error("Organisation fetch error:", err);
      setError(err?.response?.data?.detail || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  return { organisations, loading, error, refetch: fetchOrganisations };
}
