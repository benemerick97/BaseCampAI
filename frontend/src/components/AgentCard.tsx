
interface Agent {
  key: string;
  name: string;
  description: string;
  type: string;
}

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agentKey: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onEdit, onDelete }) => {
  return (
    <div
      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer group"
      onClick={() => onEdit(agent)}
    >
      <h2 className="text-lg font-semibold text-gray-800">{agent.name}</h2>
      <p className="text-sm text-gray-500">{agent.description}</p>
      <p className="text-xs mt-2 inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase font-medium">
        {agent.type}
      </p>
      <div
        className="flex gap-4 mt-3 opacity-0 group-hover:opacity-100 transition"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit(agent)}
          className="text-sm text-blue-600 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(agent.key)}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AgentCard;
