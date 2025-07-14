// frontend/src/components/OrgAdmin/UserAssignedTraining.tsx

import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axiosInstance";
import { useAuth } from "../../contexts/AuthContext";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";

interface DisplayItem {
  id: string;
  name: string;
  description?: string;
  assigned_at: string;
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
        type: "Course",
      }));

      const formattedSkills: DisplayItem[] = skillsRes.data.map((item: any) => ({
        id: item.skill.id,
        name: item.skill.name,
        description: item.skill.description,
        assigned_at: item.assigned_at,
        type: "Skill",
      }));

      const formattedModules: DisplayItem[] = modulesRes.data.map((item: any) => ({
        id: item.module.id,
        name: item.module.name,
        description: item.module.description,
        assigned_at: item.assigned_at,
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

  if (isLoading) return <div className="p-4 text-gray-600">Loading {label.toLowerCase()}...</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{label}</h2>

      {assignedItems.length === 0 ? (
        <p className="text-gray-500">No training assigned to this user.</p>
      ) : (
        <table className="min-w-full text-sm border mb-6">
          <thead className="bg-gray-100 border-b text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {assignedItems.map((item) => (
              <tr
                key={`${item.type}-${item.id}`}
                className="border-b cursor-pointer hover:bg-gray-100"
                onClick={() => handleRowClick(item)}
              >
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.description ?? "—"}</td>
                <td className="px-4 py-2">{item.type}</td>
                <td className="px-4 py-2">
                  {item.assigned_at
                    ? new Date(item.assigned_at).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
