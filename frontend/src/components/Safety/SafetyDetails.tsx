// frontend/src/components/Safety/SafetyDetails.tsx

import { FiShield, FiAlertTriangle, FiFileText } from "react-icons/fi";
import DetailsPage from "../Shared/DetailsPage";

interface SafetyDetailsProps {
  setMainPage: (page: string) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export default function SafetyDetails({  }: SafetyDetailsProps) {
  const tabConfig = [
    {
      key: "incident-reports",
      label: "Incident Reports",
      icon: <FiAlertTriangle />,
      content: <div className="p-4 text-sm text-gray-700">Coming soon</div>,
    },
    {
      key: "safety-docs",
      label: "Safety Documents",
      icon: <FiFileText />,
      content: <div className="p-4 text-sm text-gray-700">Coming soon</div>,
    },
    {
      key: "training-tracker",
      label: "Training Tracker",
      icon: <FiShield />,
      content: <div className="p-4 text-sm text-gray-700">Coming soon</div>,
    },
  ];

  return (
    <DetailsPage
      title="Safety"
      breadcrumbs={[]}
      tabs={tabConfig}
    />
  );
}
