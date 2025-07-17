// frontend/src/components/common/StatusBadge.tsx

interface StatusBadgeProps {
  status: "assigned" | "completed" | "overdue" | "expired";
}

const STATUS_STYLES: Record<StatusBadgeProps["status"], string> = {
  assigned: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-700",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const badgeStyle = STATUS_STYLES[status];

  return (
    <span className={`px-2 py-0.5 text-xs rounded font-medium ${badgeStyle}`}>
      {label}
    </span>
  );
}
