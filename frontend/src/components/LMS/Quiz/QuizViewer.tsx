// components/Learn/QuizViewer.tsx
import { useState } from "react";

interface Question {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface QuizViewerProps {
  questions: Question[];
  onComplete: (correctCount: number) => void;
}

export default function QuizViewer({ questions, onComplete }: QuizViewerProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const question = questions[current];

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    if (selected === question.correct) setCorrectCount((prev) => prev + 1);
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      onComplete(correctCount);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">
        Question {current + 1} of {questions.length}
      </h2>
      <p className="mb-4">{question.question}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isCorrect = opt === question.correct;
          const isSelected = opt === selected;

          let className =
            "block px-4 py-2 border rounded cursor-pointer transition-colors duration-200";
          if (submitted) {
            if (isSelected && isCorrect) className += " bg-green-100 border-green-500";
            else if (isSelected) className += " bg-red-100 border-red-500";
            else if (isCorrect) className += " bg-green-50 border-green-300";
          } else {
            className += isSelected ? " bg-blue-100 border-blue-500" : " hover:bg-gray-100";
          }

          return (
            <div
              key={i}
              className={className}
              onClick={() => !submitted && setSelected(opt)}
            >
              {opt}
            </div>
          );
        })}
      </div>
      {submitted ? (
        <div className="mt-4">
          <p className="text-sm text-gray-600">{question.explanation}</p>
          <button
            onClick={handleNext}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            {current + 1 < questions.length ? "Next Question" : "Finish"}
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Submit Answer
        </button>
      )}
    </div>
  );
}

