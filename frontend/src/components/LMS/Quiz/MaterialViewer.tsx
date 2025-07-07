// components/Learn/MaterialViewer.tsx
interface Slide {
  title: string;
  bullets: string[];
}

interface MaterialViewerProps {
  slides: Slide[];
  currentSlide: number;
  onNext: () => void;
}

export default function MaterialViewer({ slides, currentSlide, onNext }: MaterialViewerProps) {
  const slide = slides[currentSlide];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">{slide.title}</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-800 mb-6">
        {slide.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <button
        onClick={onNext}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {currentSlide + 1 === slides.length ? "Start Quiz" : "Next Slide"}
      </button>
    </div>
  );
}
