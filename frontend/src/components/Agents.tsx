import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const BACKEND_URL = "https://basecampai.ngrok.io";

interface Agent {
  key: string;
  name: string;
  description: string;
  type: string;
}

const Agents = () => {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    agent_key: "",
    name: "",
    description: "",
    prompt: "",
    type: "prompt", // Default to 'prompt'
  });

  const headers: Record<string, string> | undefined = orgId
    ? { "x-org-id": orgId, "Content-Type": "application/json" }
    : undefined;

  const fetchAgents = async () => {
    if (!orgId) return;

    try {
      const res = await fetch(`${BACKEND_URL}/agents`, { headers });
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (err) {
      console.error("Failed to load agents:", err);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [orgId]);

  const handleCreateOrUpdateAgent = async () => {
    if (!orgId) return;
    setLoading(true);

    const method = editingKey ? "PUT" : "POST";
    const url = editingKey
      ? `${BACKEND_URL}/agents/${editingKey}`
      : `${BACKEND_URL}/agents/register`;

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          agent_key: form.agent_key,
          name: form.name,
          description: form.description,
          prompt: form.prompt,
          filter: { agent_id: form.agent_key },
          type: form.type,
        }),
      });

      if (res.ok) {
        setForm({
          agent_key: "",
          name: "",
          description: "",
          prompt: "",
          type: "prompt",
        });
        setShowForm(false);
        setEditingKey(null);
        await fetchAgents();
      } else {
        const err = await res.json();
        alert("Error: " + err.detail);
      }
    } catch (err) {
      console.error("Save agent failed:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (agent: Agent) => {
    if (!orgId) return;

    try {
      const res = await fetch(`${BACKEND_URL}/agents/${agent.key}`, {
        headers: { "x-org-id": orgId },
      });

      if (!res.ok) throw new Error("Failed to fetch agent details");

      const fullAgent = await res.json();

      setForm({
        agent_key: fullAgent.agent_key,
        name: fullAgent.name,
        description: fullAgent.description,
        prompt: fullAgent.prompt,
        type: fullAgent.type || "prompt",
      });

      setEditingKey(agent.key);
      setShowForm(true);
    } catch (err) {
      console.error("Error fetching agent:", err);
      alert("Failed to load agent details.");
    }
  };

  const handleDeleteAgent = async (agentKey: string) => {
    if (!orgId) return;

    const confirmed = confirm("Are you sure you want to delete this agent?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${BACKEND_URL}/agents/${agentKey}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        await fetchAgents();
      } else {
        const err = await res.json();
        alert("Delete failed: " + err.detail);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Something went wrong.");
    }
  };

  const handleCancelForm = () => {
    setForm({
      agent_key: "",
      name: "",
      description: "",
      prompt: "",
      type: "prompt",
    });
    setEditingKey(null);
    setShowForm(false);
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Agents</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) handleCancelForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? "Cancel" : "Create Agent"}
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 mb-6">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Agent Key"
            value={form.agent_key}
            onChange={(e) => setForm({ ...form, agent_key: e.target.value })}
            disabled={!!editingKey}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Agent Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Prompt"
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            rows={4}
          />
          <select
            className="w-full border rounded px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="prompt">Prompt Only</option>
            <option value="retrieval">Retrieval</option>
          </select>
          <button
            onClick={handleCreateOrUpdateAgent}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {loading
              ? editingKey
                ? "Updating..."
                : "Creating..."
              : editingKey
              ? "Update Agent"
              : "Save Agent"}
          </button>
        </div>
      )}

      {agents.length === 0 ? (
        <div className="text-gray-500 text-center mt-12">
          No agents found. Click "Create Agent" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.key}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-gray-800">{agent.name}</h2>
              <p className="text-sm text-gray-500">{agent.description}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase">{agent.type}</p>
              <div className="flex gap-4 mt-3">
                <button
                  onClick={() => handleEditClick(agent)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAgent(agent.key)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;
