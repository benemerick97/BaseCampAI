interface AgentSuggestionsProps {
  suggestions: string[];
  onSelect: (agent: string) => void;
}

export default function AgentSuggestions({ suggestions, onSelect }: AgentSuggestionsProps) {
  return (
    <div className="absolute top-12 left-0 z-20 w-72 bg-white border border-gray-200 rounded-md shadow-lg text-sm overflow-hidden">
      {suggestions.map((agent) => (
        <button
          key={agent}
          onClick={() => onSelect(agent)}
          className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:bg-blue-100 transition-all"
        >
          @{agent}
        </button>
      ))}
    </div>
  );
}
