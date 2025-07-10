// frontend/src/components/LMS/CourseBuilder/Tabs/AssignedContentTab.tsx

import { type Dispatch, type SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../../contexts/SelectedEntityContext";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface Course {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface Skill {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface DisplayItem {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  type: "Course" | "Skill";
}

interface Props {
  moduleId: string;
  setMainPage: Dispatch<SetStateAction<"details" | "coursedetails" | "skilldetails" | "userdetails">>;
  label?: string;
}

export default function AssignedContentTab({ moduleId, label = "Content", setMainPage }: Props) {
  const { user, token } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();
  const orgId = user?.organisation?.id?.toString();

  const headers =
    orgId && token
      ? {
          "x-org-id": orgId,
          Authorization: `Bearer ${token}`,
        }
      : undefined;

  const { data: contentItems = [], isLoading } = useQuery<DisplayItem[]>({
    queryKey: ["module-content", moduleId, orgId],
    queryFn: async () => {
      if (!headers) return [];

      const [courseRes, skillRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/learn/modules/${moduleId}/courses`, { headers }),
        axios.get(`${BACKEND_URL}/learn/modules/${moduleId}/skills`, { headers }),
      ]);

      const formattedCourses: DisplayItem[] = courseRes.data.map((course: Course) => ({
        ...course,
        type: "Course",
      }));

      const formattedSkills: DisplayItem[] = skillRes.data.map((skill: Skill) => ({
        ...skill,
        type: "Skill",
      }));

      return [...formattedCourses, ...formattedSkills].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!moduleId && !!orgId && !!token,
    staleTime: 1000 * 60 * 5,
  });

  const handleRowClick = (item: DisplayItem) => {
    const type = item.type === "Course" ? "course" : "skill";
    setSelectedEntity({ type, id: item.id });
    setMainPage(type === "course" ? "coursedetails" : "skilldetails");
  };

  if (isLoading) return <div className="p-4 text-gray-600">Loading {label.toLowerCase()}...</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{label}</h2>

      {contentItems.length === 0 ? (
        <p className="text-gray-500">No courses or skills assigned to this module.</p>
      ) : (
        <table className="min-w-full text-sm border mb-6">
          <thead className="bg-gray-100 border-b text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {contentItems.map((item) => (
              <tr
                key={`${item.type}-${item.id}`}
                className="border-b cursor-pointer hover:bg-gray-100"
                onClick={() => handleRowClick(item)}
              >
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.description ?? "—"}</td>
                <td className="px-4 py-2">{item.type}</td>
                <td className="px-4 py-2">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
