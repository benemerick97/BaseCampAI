// frontend/src/components/LMS/MySkills.tsx

import { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface Skill {
  id: string;
  name: string;
  description?: string;
  evidence_required: boolean;
  created_at: string;
}

interface AssignedSkill {
  id: number;
  user_id: number;
  skill_id: string;
  assigned_by?: number;
  assigned_at: string;
  completed_at?: string;
  evidence_file_url?: string;
  status: "assigned" | "completed";
  skill: Skill;
}

export default function MySkills({ setMainPage }: { setMainPage: (p: string) => void }) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();
  const [assignments, setAssignments] = useState<AssignedSkill[]>([]);
  const [statusFilter, setStatusFilter] = useState<"assigned" | "completed" | "all">("assigned");
  const [searchTerm, setSearchTerm] = useState("");
  const [showExtraFilters, setShowExtraFilters] = useState(false);

  const fetchAssignments = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`${BACKEND_URL}/learn/assigned-skills`, {
        params: { user_id: user.id },
      });
      setAssignments(res.data);
    } catch (err) {
      console.error("Failed to fetch assigned skills:", err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchAssignments();
  }, [user]);

  const handleMarkComplete = async (skillId: string) => {
    try {
      await api.post(`${BACKEND_URL}/learn/complete-skill`, {
        user_id: user?.id,
        skill_id: skillId,
        evidence_file_url: null,
      });
      fetchAssignments();
    } catch (err) {
      console.error("Failed to complete skill:", err);
    }
  };

  const handleUploadEvidence = (assignment: AssignedSkill) => {
    setSelectedEntity({ type: "assignedSkill", id: assignment.id, data: assignment });
    setMainPage("skillevidence");
  };

  const renderRow = (assignment: AssignedSkill) => {
    const { skill } = assignment;
    if (!skill || !skill.id || !skill.name) return null;

    return (
      <>
        <td className="px-4 py-3 border-r border-gray-100 font-semibold text-gray-900">
          {skill.name}
        </td>
        <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
          {skill.description || "—"}
        </td>
        <td className="px-4 py-3 border-r border-gray-100 text-center text-gray-700">
          {assignment.status === "completed"
            ? new Date(assignment.completed_at!).toLocaleDateString()
            : "—"}
        </td>
        <td className="px-4 py-3 border-r border-gray-100 text-center text-gray-700">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100">
            {assignment.status}
          </span>
        </td>
        <td className="px-4 py-3 border-r border-gray-100 text-right">
          {assignment.status === "completed" ? (
            <span className="text-sm text-gray-400">Done</span>
          ) : skill.evidence_required ? (
            <button
              onClick={() => handleUploadEvidence(assignment)}
              className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Upload
            </button>
          ) : (
            <button
              onClick={() => handleMarkComplete(skill.id)}
              className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Mark Complete
            </button>
          )}
        </td>
      </>
    );
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      a.skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const headerContent = (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search your skills"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full sm:w-auto flex-grow sm:flex-none"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowExtraFilters((prev) => !prev)}
            className="text-sm text-blue-600 font-medium hover:underline border px-3 py-1.5 rounded"
          >
            + Add filter
          </button>

          {["assigned", "completed", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as "assigned" | "completed" | "all")}
              className={`px-3 py-1.5 rounded text-sm font-medium border ${
                statusFilter === status
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {showExtraFilters && (
        <div className="bg-gray-50 border border-gray-200 p-3 rounded text-sm text-gray-600">
          <p className="mb-1 font-medium">Additional filters coming soon!</p>
          <ul className="list-disc pl-5 text-xs text-gray-500">
            <li>Date ranges</li>
            <li>Status toggles</li>
            <li>Skill categories</li>
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <LearnListPage<AssignedSkill>
      title="My Skills"
      entityType="assignedSkill"
      items={filteredAssignments}
      onFetch={fetchAssignments}
      onSelect={() => {}}
      renderRow={renderRow}
      columns={["Title", "Description", "Completed", "Status", "Actions"]}
      showSearchBar={false}
      headerContent={headerContent}
    />
  );
}
