import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/axiosInstance"; // ✅ import your Axios wrapper

export function useAgentSuggestions() {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const [knownAgents, setKnownAgents] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // 🔁 Fetch agent keys dynamically
  useEffect(() => {
    const fetchAgents = async () => {
      if (!orgId) return;

      try {
        const res = await api.get("/agents", {
          headers: {
            "x-org-id": orgId,
            "Content-Type": "application/json",
          },
        });

        const agentKeys = (res.data.agents || []).map((agent: any) => agent.key);
        setKnownAgents(agentKeys);
      } catch (err) {
        console.error("❌ Failed to fetch agent list:", err);
      }
    };

    fetchAgents();
  }, [orgId]);

  // ✏️ Suggest based on @ input
  const updateSuggestions = (input: string) => {
    const match = input.match(/^@(\w*)/);
    if (match) {
      const partial = match[1].toLowerCase();
      const filtered = knownAgents.filter((a) => a.startsWith(partial));
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // ✅ Apply selected agent
  const selectSuggestion = (agent: string, setQuery: (val: string) => void) => {
    setSelectedAgent(agent);
    setQuery(""); // clear query input after selection
    setShowSuggestions(false);
  };

  const clearSelectedAgent = () => {
    setSelectedAgent(null);
  };

  // 🔎 Parse @agentKey message and validate against known agents
  const extractAgentKey = (input: string) => {
    const match = input.match(/^@(\w+)\s+(.*)/);
    const agentKey = match?.[1]?.toLowerCase();
    const messageBody = match?.[2] || input;
    const isValidAgent = agentKey && knownAgents.includes(agentKey);
    return {
      agentKey: isValidAgent ? agentKey : null,
      message: messageBody,
    };
  };

  return {
    suggestions,
    showSuggestions,
    selectedAgent,
    selectSuggestion,
    clearSelectedAgent,
    updateSuggestions,
    setShowSuggestions,
    extractAgentKey,
  };
}
