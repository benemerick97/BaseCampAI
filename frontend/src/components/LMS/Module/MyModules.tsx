// frontend/src/components/LMS/Module/MyModules.tsx

import { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../../contexts/AuthContext";
import LearnListPage from "../LearnListPage";
import MyModuleRow from "./MyModulesRow";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";

interface Module {
  id: string;
  name: string;
  description?: string;
  org_id: string;
  created_at: string;
}

interface AssignedModule {
  id: number;
  user_id: number;
  module_id: string;
  assigned_at: string;
  due_date?: string;
  completed_at?: string;
  status: "assigned" | "completed";
  module: Module;
}

interface MyModulesProps {
  setMainPage: (page: string) => void;
}

export default function MyModules({ setMainPage }: MyModulesProps) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();
  const [assignments, setAssignments] = useState<AssignedModule[]>([]);
  const [statusFilter, setStatusFilter] = useState<"assigned" | "completed" | "all">("assigned");
  const [searchTerm, setSearchTerm] = useState("");
  const [showExtraFilters, setShowExtraFilters] = useState(false);

  const fetchAssignments = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/learn/assigned-modules/by-user/${user.id}`);
      setAssignments(res.data);
    } catch (err) {
      console.error("Failed to fetch assigned modules:", err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchAssignments();
  }, [user]);

  const handleStartClick = (moduleId: string) => {
    console.log("Start module", moduleId);
    // TODO: Launch module viewer
  };

  const handleSelect = (assignmentId: number) => {
    setSelectedEntity({ type: "assignedModule", id: assignmentId });
    setMainPage("mymoduledetails");
  };

  const renderRow = (assignment: AssignedModule) => (
    <MyModuleRow assignment={assignment} onStart={handleStartClick} />
  );

  const filteredAssignments = assignments.filter((a) => {
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      a.module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.module.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const headerContent = (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search your modules"
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
            <li>Completion %</li>
            <li>Tags or themes</li>
            <li>Assigned date filters</li>
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <LearnListPage<AssignedModule>
      title="My Modules"
      entityType="assignedModule"
      items={filteredAssignments}
      onFetch={fetchAssignments}
      onSelect={(id) => handleSelect(id as number)}
      renderRow={renderRow}
      columns={["Title", "Description", "Assigned", "Due", "Completed", "Status", "Actions"]}
      showSearchBar={false}
      headerContent={headerContent}
    />
  );
}
