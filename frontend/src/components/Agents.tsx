import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Modal from "../components/Modal";
import CreateAgent from "../components/Forms/CreateAgent";
import AgentCard from "../components/AgentCard";
import { FiPlus } from "react-icons/fi";

const BACKEND_URL = "https://basecampai.ngrok.io";

interface Agent {
  key: string;
  name: string;
  description: string;
  type: string;
}

const Agents = () => {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString() || "";

  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form, setForm] = useState({
    agent_key: "",
    name: "",
    description: "",
    prompt: "",
    type: "prompt",
  });

  const headers: Record<string, string> = {
    "x-org-id": orgId,
    "Content-Type": "application/json",
  };

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

  const handleEditClick = async (agent: Agent) => {
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

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-semibold leading-tight">Agents</h3>
          <span className="text-sm text-gray-600">
            ({filteredAgents.length > 0 ? `1 - ${filteredAgents.length}` : 0} of {agents.length})
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setForm({
                agent_key: "",
                name: "",
                description: "",
                prompt: "",
                type: "prompt",
              });
              setEditingKey(null);
              setShowForm(true);
            }}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
          >
            <FiPlus size={16} />
            Create Agent
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search all agents"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-sm text-sm"
        />
        <button className="text-sm text-blue-600 font-medium">+ Add filter</button>
      </div>

      {/* Agent List */}
      <div className="relative border rounded-lg bg-white">
        {filteredAgents.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <p className="text-lg font-medium">No agents found</p>
            <p className="text-sm mt-1">Click "Create Agent" to add your first one.</p>
          </div>
        ) : (
          <div className="max-h-[75vh] overflow-y-auto p-2 pr-3 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.key}
                  agent={agent}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteAgent}
                />
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCancelForm}
        title={editingKey ? "Edit Agent" : "Create Agent"}
        maxWidth="max-w-2xl"
      >
        <CreateAgent
          initialValues={editingKey ? form : undefined}
          onCancel={handleCancelForm}
          onSuccess={async () => {
            handleCancelForm();
            await fetchAgents();
          }}
          orgId={orgId}
        />
      </Modal>
    </div>
  );
};

export default Agents;
