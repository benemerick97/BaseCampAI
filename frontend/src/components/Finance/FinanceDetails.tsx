// frontend/src/components/Finance/FinanceDetails.tsx

import { FiCreditCard, FiTrendingUp, FiFileText } from "react-icons/fi";
import DetailsPage from "../Shared/DetailsPage";

interface FinanceDetailsProps {
  setMainPage: (page: string) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export default function FinanceDetails({ }: FinanceDetailsProps) {
  const tabConfig = [
    {
      key: "expenses",
      label: "Expenses",
      icon: <FiCreditCard />,
      content: <div className="p-4 text-sm text-gray-700">Coming soon</div>,
    },
    {
      key: "budgets",
      label: "Budgets",
      icon: <FiTrendingUp />,
      content: <div className="p-4 text-sm text-gray-700">Coming soon</div>,
    },
    {
      key: "invoices",
      label: "Invoices",
      icon: <FiFileText />,
      content: <div className="p-4 text-sm text-gray-700">Coming soon</div>,
    },
  ];

  return (
    <DetailsPage
      title="Finance"
      breadcrumbs={[]}
      tabs={tabConfig}
    />
  );
}
