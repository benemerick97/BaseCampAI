// frontend/src/components/OrgAdmin/UserAssignedTraining.tsx

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axiosInstance";
import { useAuth } from "../../contexts/AuthContext";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";

interface DisplayItem {
  id: string;
  name: string;
  description?: string;
  assigned_at: string;
  status: string;
  type: "Course" | "Skill" | "Module";
}

interface Props {
  userId: string;
  setMainPage: (page: "details" | "coursedetails" | "skilldetails" | "moduledetails" | "userdetails") => void;
  label?: string;
}

export default function UserAssignedTraining({ userId, label = "Assigned Training", setMainPage }: Props) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();
  const orgId = user?.organisation?.id?.toString();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Course" | "Skill" | "Module">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "assigned" | "completed" | "skipped">("All");

  const headers = orgId ? { "x-org-id": orgId } : undefined;

  const { data: assignedItems = [], isLoading } = useQuery<DisplayItem[]>({
    queryKey: ["user-training", userId, orgId],
    queryFn: async () => {
      if (!headers) return [];

      const [coursesRes, skillsRes, modulesRes] = await Promise.all([
        api.get(`/learn/assigned-courses?user_id=${userId}`, { headers }),
        api.get(`/learn/assigned-skills?user_id=${userId}`, { headers }),
        api.get(`/learn/assigned-modules/by-user/${userId}`, { headers }),
      ]);

      const formattedCourses: DisplayItem[] = coursesRes.data.map((item: any) => ({
        id: item.course.id,
        name: item.course.name,
        description: item.course.description,
        assigned_at: item.assigned_at,
        status: item.status ?? "assigned",
        type: "Course",
      }));

      const formattedSkills: DisplayItem[] = skillsRes.data.map((item: any) => ({
        id: item.skill.id,
        name: item.skill.name,
        description: item.skill.description,
        assigned_at: item.assigned_at,
        status: item.status ?? "assigned",
        type: "Skill",
      }));

      const formattedModules: DisplayItem[] = modulesRes.data.map((item: any) => ({
        id: item.module.id,
        name: item.module.name,
        description: item.module.description,
        assigned_at: item.assigned_at,
        status: item.status ?? "assigned",
        type: "Module",
      }));

      return [...formattedCourses, ...formattedSkills, ...formattedModules].sort(
        (a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
      );
    },
    enabled: !!userId && !!orgId,
    staleTime: 1000 * 60 * 5,
  });

  const handleRowClick = (item: DisplayItem) => {
    const type = item.type.toLowerCase() as "course" | "skill" | "module";
    setSelectedEntity({ type, id: item.id });

    if (type === "course") setMainPage("coursedetails");
    else if (type === "skill") setMainPage("skilldetails");
    else setMainPage("moduledetails");
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
  };

  const filteredItems = useMemo(() => {
    return assignedItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || item.type === typeFilter;
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assignedItems, search, typeFilter, statusFilter]);

  if (isLoading) return <div className="p-4 text-gray-600">Loading {label.toLowerCase()}...</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{label}</h2>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by name or description"
          className="border px-3 py-1.5 rounded-md text-sm w-full sm:w-64 focus:outline-none focus:ring focus:border-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600">Type:</span>
          <select
            className="border px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring focus:border-blue-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="All">All Types</option>
            <option value="Course">Course</option>
            <option value="Skill">Skill</option>
            <option value="Module">Module</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600">Status:</span>
          <select
            className="border px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>

        <button
          onClick={clearFilters}
          className="px-3 py-1.5 text-sm bg-gray-100 border rounded-md hover:bg-gray-200"
        >
          Clear Filters
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-gray-500">No training matches your search or filter.</p>
      ) : (
        <table className="min-w-full text-sm border mb-6">
          <thead className="bg-gray-100 border-b text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Assigned</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr
                key={`${item.type}-${item.id}`}
                className="border-b cursor-pointer hover:bg-gray-100"
                onClick={() => handleRowClick(item)}
              >
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.description ?? "—"}</td>
                <td className="px-4 py-2">{item.type}</td>
                <td className="px-4 py-2">
                  {item.assigned_at ? new Date(item.assigned_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                      item.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : item.status === "skipped"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
