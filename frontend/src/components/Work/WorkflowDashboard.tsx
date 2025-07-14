// frontend/src/components/Workflow/WorkflowDashboard.tsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/axiosInstance";
import { FiClipboard, FiClock, FiAlertTriangle, FiCheck } from "react-icons/fi";

const WorkflowDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    assigned: 0,
    dueSoon: 0,
    overdue: 0,
    completed: 0,
  });
  const [inProgress, setInProgress] = useState<any[]>([]);
  const [dueThisWeek, setDueThisWeek] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("/workflows/dashboard", {
        headers: { "x-org-id": user?.organisation?.id },
      });
      setSummary(res.data.summary);
      setInProgress(res.data.in_progress);
      setDueThisWeek(res.data.due_this_week);
      setOverdue(res.data.overdue);
    };

    if (user) fetchData();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome back, {user?.first_name}!</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={<FiClipboard />} label="Assigned Tasks" count={summary.assigned} />
        <SummaryCard icon={<FiClock />} label="Due Soon" count={summary.dueSoon} />
        <SummaryCard icon={<FiAlertTriangle />} label="Overdue Tasks" count={summary.overdue} />
        <SummaryCard icon={<FiCheck />} label="Completed" count={summary.completed} />
      </div>

      {/* Task Sections */}
      <TaskSection title="In Progress" items={inProgress} />
      <TaskSection title="Due This Week" items={dueThisWeek} />
      <TaskSection title="Overdue" items={overdue} highlight="danger" />
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

const TaskSection = ({
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
              <div className="font-medium">{item.workflow_name}</div>
              <div className="text-sm text-gray-500">
                Step: {item.step_title} • Due: {new Date(item.due_date).toLocaleDateString()}
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

export default WorkflowDashboard;
