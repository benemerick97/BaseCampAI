// frontend/src/components/Agents.tsx

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import Modal from "./UI/Modal";
import CreateAgent from "../components/Forms/CreateAgent";
import AgentCard from "../components/AgentCard";
import { FiPlus, FiMoreHorizontal } from "react-icons/fi";
import api from "../utils/axiosInstance";

interface Agent {
  key: string;
  name: string;
  description: string;
  type: string;
}

const fetchAgents = async (orgId: string): Promise<Agent[]> => {
  if (!orgId) return [];
  const res = await api.get(`/agents`, {
    headers: {
      "x-org-id": orgId,
      "Content-Type": "application/json",
    },
  });
  return res.data.agents || [];
};

const deleteAgent = async ({ agentKey, orgId }: { agentKey: string; orgId: string }) => {
  try {
    await api.delete(`/agents/${agentKey}`, {
      headers: {
        "x-org-id": orgId,
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    const errDetail =
      error?.response?.data?.detail || error?.message || "Failed to delete agent.";
    throw new Error(errDetail);
  }
};

const Agents = () => {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString() || "";
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [form, setForm] = useState({
    agent_key: "",
    name: "",
    description: "",
    prompt: "",
    type: "prompt",
  });

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents", orgId],
    queryFn: () => fetchAgents(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents", orgId] });
    },
    onError: (error: any) => {
      alert("Delete failed: " + error.message);
    },
  });

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleEditClick = async (agent: Agent) => {
    try {
      const res = await api.get(`/agents/${agent.key}`, {
        headers: { "x-org-id": orgId },
      });

      const fullAgent = res.data;

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
    deleteMutation.mutate({ agentKey, orgId });
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

  if (isLoading) {
    return <div className="p-6 text-gray-600">Loading agents...</div>;
  }

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
            onClick={() => setViewMode("card")}
            className={`px-3 py-1.5 text-sm rounded border ${
              viewMode === "card"
                ? "bg-blue-600 text-white"
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
            }`}
          >
            Card View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 text-sm rounded border ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
            }`}
          >
            List View
          </button>
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

      {/* Agent Display */}
      <div className="relative border rounded-lg bg-white">
        {filteredAgents.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <p className="text-lg font-medium">No agents found</p>
            <p className="text-sm mt-1">Click "Create Agent" to add your first one.</p>
          </div>
        ) : viewMode === "card" ? (
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
        ) : (
          <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left text-gray-600 font-medium border-b">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((agent) => (
                  <tr key={agent.key} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold text-gray-900">{agent.name}</td>
                    <td className="px-4 py-2 text-gray-700">{agent.description}</td>
                    <td className="px-4 py-2 text-gray-600 uppercase">{agent.type}</td>
                    <td className="px-4 py-2 text-right relative">
                      <div className="inline-block text-left z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen((prev) => (prev === agent.key ? null : agent.key));
                          }}
                          className="p-2 rounded hover:bg-gray-100"
                        >
                          <FiMoreHorizontal className="w-5 h-5 text-gray-600" />
                        </button>
                        {dropdownOpen === agent.key && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(agent);
                                setDropdownOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAgent(agent.key);
                                setDropdownOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            await queryClient.invalidateQueries({ queryKey: ["agents", orgId] });
          }}
          orgId={orgId}
        />
      </Modal>
    </div>
  );
};

export default Agents;
