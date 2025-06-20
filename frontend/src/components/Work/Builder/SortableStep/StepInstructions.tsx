// components/Work/Builder/StepInstructions.tsx


interface StepInstructionsProps {
  instructions: string;
  onChange: (val: string) => void;
}

export default function StepInstructions({ instructions, onChange }: StepInstructionsProps) {
  return (
    <div className="pt-2">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Step instructions:
      </label>
      <textarea
        className="w-full text-sm border border-gray-300 rounded px-2 py-1 mb-4"
        placeholder="Add extra instructions..."
        rows={2}
        value={instructions}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
