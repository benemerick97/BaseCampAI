interface SuggestionButtonsProps {
  setQuery: (query: string) => void;
}

const suggestions = [
  { label: "Search all", text: "" },
  { label: "Policy", text: "What is the company policy on " },
  { label: "Procedure", text: "What is the procedure for " },
  { label: "Troubleshoot", text: "How do I fix " },
  { label: "Technical", text: "How would an AllScan be used in " },
];

const SuggestionButtons: React.FC<SuggestionButtonsProps> = ({ setQuery }) => {
  return (
    <div className="flex flex-wrap justify-center mt-6 gap-3">
      {suggestions.map(({ label, text }) => (
        <button
          key={label}
          onClick={() => setQuery(text)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-300"
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default SuggestionButtons;
