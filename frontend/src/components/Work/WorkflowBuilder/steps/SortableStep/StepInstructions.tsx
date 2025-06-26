// components/Work/Builder/StepInstructions.tsx

interface StepInstructionsProps {
  instructions: string;
  onChange: (val: string) => void;
}

export default function StepInstructions({ instructions, onChange }: StepInstructionsProps) {
  return (
    <div className="pt-2">
      <label
        htmlFor="step-instructions"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Step instructions:
      </label>
      <textarea
        id="step-instructions"
        aria-label="Step instructions"
        className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        placeholder="Add extra instructions..."
        rows={2}
        value={instructions}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
