// frontend/src/components/HR/HRDetails.tsx

import { FiUsers, FiBriefcase, FiUserCheck } from "react-icons/fi";
import DetailsPage from "../Shared/DetailsPage";

interface HRDetailsProps {
  setMainPage: (page: string) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export default function HRDetails({ }: HRDetailsProps) {
  const tabConfig = [
    {
      key: "employee-directory",
      label: "Employee Directory",
      icon: <FiUsers />,
      content: <div className="p-4 text-sm text-gray-700">Coming soon</div>,
    },
    {
      key: "leave-management",
      label: "Leave Management",
      icon: <FiBriefcase />,
      content: <div className="p-4 text-sm text-gray-700">Coming soon</div>,
    },
    {
      key: "onboarding",
      label: "Onboarding",
      icon: <FiUserCheck />,
      content: <div className="p-4 text-sm text-gray-700">Coming soon</div>,
    },
  ];

  return (
    <DetailsPage
      title="Human Resources"
      breadcrumbs={[]}
      tabs={tabConfig}
    />
  );
}
