// frontend/src/components/LMS/LMSDashboard.tsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/axiosInstance";
import { FiBook, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

const LMSDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    assigned: 0,
    dueSoon: 0,
    overdue: 0,
    completed: 0,
  });
  const [nextUp, setNextUp] = useState<any[]>([]);
  const [dueThisWeek, setDueThisWeek] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      const res = await api.get("/learn/dashboard", {
        headers: { "x-org-id": user?.organisation?.id },
      });
      setSummary(res.data.summary);
      setNextUp(res.data.next_up);
      setDueThisWeek(res.data.due_this_week);
      setOverdue(res.data.overdue);
    };

    if (user) fetchDashboard();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome back, {user?.first_name}!</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={<FiBook />} label="Assigned" count={summary.assigned} />
        <SummaryCard icon={<FiClock />} label="Due Soon" count={summary.dueSoon} />
        <SummaryCard icon={<FiAlertCircle />} label="Overdue" count={summary.overdue} />
        <SummaryCard icon={<FiCheckCircle />} label="Completed" count={summary.completed} />
      </div>

      {/* Next Up Section */}
      <Section title="Next Up" items={nextUp} />

      {/* Due This Week Section */}
      <Section title="Due This Week" items={dueThisWeek} />

      {/* Overdue Section */}
      <Section title="Overdue" items={overdue} highlight="danger" />
    </div>
  );
};

const SummaryCard = ({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) => (
  <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
    <div className="text-2xl text-primary">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{count}</div>
    </div>
  </div>
);

const Section = ({
  title,
  items,
  highlight,
}: {
  title: string;
  items: any[];
  highlight?: "danger";
}) => {
  if (!items.length) return null;
  return (
    <div className="mb-6">
      <h2 className={`text-xl font-semibold mb-3 ${highlight === "danger" ? "text-red-600" : ""}`}>{title}</h2>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="bg-gray-50 p-4 rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-500">
                {item.type} • Due: {new Date(item.due_date).toLocaleDateString()}
              </div>
            </div>
            <button className="bg-primary text-white px-3 py-1 rounded text-sm">
              {item.status === "assigned" ? "Start" : "Continue"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LMSDashboard;
