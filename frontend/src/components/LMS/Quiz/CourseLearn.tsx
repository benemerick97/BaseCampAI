import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import MaterialViewer from "./MaterialViewer";
import QuizViewer from "./QuizViewer";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface Slide {
  title: string;
  bullets: string[];
}

interface Question {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface Course {
  id: string;
  name: string;
  description?: string;
  slides: Slide[];
  document_id: string;
}

export default function CourseLearn() {
  const { user } = useAuth();
  const { selectedEntity } = useSelectedEntity();
  const orgId = user?.organisation?.id?.toString();

  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const lastFetchedCourseId = useRef<string | null>(null);
  const isFetching = useRef(false);

  const fetchCourseAndQuiz = useCallback(async () => {
    const courseId = selectedEntity?.id;
    const isCourse = selectedEntity?.type === "course";
    const documentId = selectedEntity?.data?.document_id;

    if (!isCourse || !orgId || !courseId || !documentId) return;
    if (lastFetchedCourseId.current === String(courseId) || isFetching.current) return;

    isFetching.current = true;

    try {
      const courseRes = await fetch(`${BACKEND_URL}/courses/${courseId}`);
      const courseData = await courseRes.json();
      setCourse(courseData);

      const quizRes = await fetch(`${BACKEND_URL}/lms/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": orgId,
        },
        body: JSON.stringify({ document_id: documentId }),
      });

      if (!quizRes.ok) throw new Error("Failed to fetch quiz questions");

      const quizData = await quizRes.json();
      setQuestions(quizData.questions);
      lastFetchedCourseId.current = String(courseId);
    } catch (err) {
      console.error("Error loading course or quiz:", err);
    } finally {
      isFetching.current = false;
    }
  }, [selectedEntity, orgId]);

  useEffect(() => {
    fetchCourseAndQuiz();
  }, [fetchCourseAndQuiz]);

  const handleNextSlide = () => {
    if (course && currentSlide + 1 < course.slides.length) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handleQuizComplete = async (correct: number) => {
    setCompleted(true);
    setCorrectAnswers(correct);

    try {
      if (!user?.id || !course?.id) return;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(orgId ? { "x-org-id": orgId } : {}),
      };

      const res = await fetch(`${BACKEND_URL}/learn/complete-course`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          user_id: user.id,
          course_id: course.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to mark course complete");

      console.log("✅ Course marked as complete");
    } catch (err) {
      console.error("❌ Error completing course:", err);
    }
  };

  const handleRestart = () => {
    setShowQuiz(true);
    setCompleted(false);
    setCorrectAnswers(0);
  };

  if (!course) return <div className="p-6">Loading course...</div>;

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      {!showQuiz ? (
        <MaterialViewer
          slides={course.slides}
          currentSlide={currentSlide}
          onNext={handleNextSlide}
        />
      ) : completed ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">🎉 Quiz Complete!</h2>
          <p className="mb-4">
            You got {correctAnswers} out of {questions.length} correct.
            <br />
            {correctAnswers === questions.length
              ? "✅ You passed!"
              : "❌ You did not pass."}
          </p>
          <button
            onClick={handleRestart}
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Try Again
          </button>
        </div>
      ) : questions.length > 0 ? (
        <QuizViewer questions={questions} onComplete={handleQuizComplete} />
      ) : (
        <p className="text-gray-500">Generating quiz...</p>
      )}
    </div>
  );
}