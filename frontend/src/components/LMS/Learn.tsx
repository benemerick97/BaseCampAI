// frontend/src/components/LMS/Learn.tsx

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface FileMeta {
  id: string;
  name: string;
  review_date?: string;
}

interface Question {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

const Learn = () => {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const [files, setFiles] = useState<FileMeta[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileMeta | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [completed, setCompleted] = useState(false);

  const headers: Record<string, string> | undefined = orgId
    ? { "x-org-id": orgId, "Content-Type": "application/json" }
    : undefined;

  const fetchFiles = async () => {
    if (!headers) return;
    try {
      const res = await fetch(`${BACKEND_URL}/document-objects`, { headers });
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("Failed to load documents:", err);
    }
  };

  const generateQuestions = async (documentId: string) => {
    if (!headers) return;

    const endpoint = `${BACKEND_URL}/lms/questions`;
    console.log("📤 Sending POST request to:", endpoint);
    console.log("📦 Payload:", { document_id: documentId });

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ document_id: documentId }),
      });

      if (!res.ok) throw new Error("Failed to generate questions");

      const data = await res.json();
      setQuestions(data.questions);
      setCurrentQuestion(0);
      setSelectedOption(null);
      setIsSubmitted(false);
      setCorrectAnswers(0);
      setCompleted(false);
    } catch (err) {
      console.error("❌ Error generating questions:", err);
    }
  };


  useEffect(() => {
    fetchFiles();
  }, [orgId]);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);

    if (selectedOption === questions[currentQuestion].correct) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setCorrectAnswers(0);
    setCompleted(false);
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      {!selectedFile ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select a document to begin training</h2>
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.id}>
                <button
                  onClick={() => {
                    setSelectedFile(file);
                    generateQuestions(file.id);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  {file.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : completed ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">🎉 Quiz Complete!</h2>
          <p className="mb-4">
            You got {correctAnswers} out of {questions.length} correct.
            <br />
            {correctAnswers === questions.length ? "✅ You passed!" : "❌ You did not pass."}
          </p>
          <button
            onClick={handleRestart}
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              setSelectedFile(null);
              setQuestions([]);
            }}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      ) : questions.length > 0 ? (
        <div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">
            Document: <span className="text-blue-600">{selectedFile?.name}</span>
          </h1>
          <h2 className="text-lg font-semibold mb-2">
            Question {currentQuestion + 1} of {questions.length}
          </h2>
          <p className="mb-4">{questions[currentQuestion].question}</p>
          <div className="space-y-2">
            {questions[currentQuestion].options.map((option, i) => {
              const isCorrect = option === questions[currentQuestion].correct;
              const isSelected = option === selectedOption;

              let className =
                "block px-4 py-2 border rounded cursor-pointer transition-colors duration-200";

              if (isSubmitted) {
                if (isSelected && isCorrect) {
                  className += " bg-green-100 border-green-500";
                } else if (isSelected && !isCorrect) {
                  className += " bg-red-100 border-red-500";
                } else if (isCorrect) {
                  className += " bg-green-50 border-green-300";
                }
              } else {
                if (isSelected) {
                  className += " bg-blue-100 border-blue-500";
                } else {
                  className += " hover:bg-gray-100";
                }
              }

              return (
                <div
                  key={i}
                  className={className}
                  onClick={() => !isSubmitted && setSelectedOption(option)}
                >
                  {option}
                </div>
              );
            })}
          </div>
          {isSubmitted ? (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {questions[currentQuestion].explanation}
              </p>
              <button
                onClick={handleNext}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              >
                {currentQuestion + 1 < questions.length ? "Next Question" : "Finish"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              Submit Answer
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Generating questions...</p>
      )}
    </div>
  );
};

export default Learn;
