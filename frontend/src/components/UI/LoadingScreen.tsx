// src/components/UI/LoadingScreen.tsx

import { FiLoader } from "react-icons/fi"; // or any spinner icon you like

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white text-gray-700">
      <div className="flex flex-col items-center gap-4">
        <FiLoader className="animate-spin text-4xl text-blue-500" />
        <p className="text-lg font-medium">Loading, please wait...</p>
      </div>
    </div>
  );
}
