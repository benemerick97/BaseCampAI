// frontend/src/components/LMS/Module/ModuleCreate.tsx

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { useAuth } from "../../../contexts/AuthContext";
import { FiX, FiPlus } from "react-icons/fi";
import api from "../../../utils/axiosInstance";

interface CourseOption {
  id: string;
  name: string;
}

interface SkillOption {
  id: string;
  name: string;
}

interface ModuleFormData {
  name?: string;
  description?: string;
  course_ids: string[];
  skill_ids: string[];
}

interface ModuleCreateProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  existingModule?: ModuleFormData & { id?: string };
}

export default function ModuleCreate({
  visible,
  onClose,
  onCreated,
  existingModule,
}: ModuleCreateProps) {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const [formData, setFormData] = useState<ModuleFormData>({
    name: "",
    description: "",
    course_ids: [],
    skill_ids: [],
  });

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");

  useEffect(() => {
    if (visible && orgId) {
      fetchCourses();
      fetchSkills();

      if (existingModule) {
        setFormData({
          name: existingModule.name || "",
          description: existingModule.description || "",
          course_ids: existingModule.course_ids || [],
          skill_ids: existingModule.skill_ids || [],
        });
      } else {
        setFormData({ name: "", description: "", course_ids: [], skill_ids: [] });
      }
    }
  }, [visible, orgId, existingModule]);

  const fetchCourses = async () => {
    if (!orgId) return;

    try {
      const res = await api.get("/courses", {
        params: { org_id: orgId }, // ✅ Query param instead of header
      });
      setCourses(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch courses", err);
    }
  };

  const fetchSkills = async () => {
    if (!orgId) return;

    try {
      const res = await api.get("/skills", {
        params: { org_id: orgId }, // ✅ Query param instead of header
      });
      setSkills(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch skills", err);
    }
  };

  const toggleItem = (key: "course_ids" | "skill_ids", id: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter((x) => x !== id)
        : [...prev[key], id],
    }));
  };

  const handleSubmit = async () => {
    if (!orgId || !formData.name) {
      alert("Please enter a module name.");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || "",
      course_ids: formData.course_ids,
      skill_ids: formData.skill_ids,
    };

    const isEditing = !!existingModule?.id;
    const endpoint = isEditing
      ? `/learn/modules/${existingModule.id}`
      : `/learn/modules/`;
    const method = isEditing ? "put" : "post";

    try {
      await api.request({
        method,
        url: endpoint,
        headers: {
          "x-org-id": orgId, // ✅ Only used here where your backend supports it
        },
        data: payload,
      });

      setFormData({ name: "", description: "", course_ids: [], skill_ids: [] });
      onCreated();
      onClose();
    } catch (err: any) {
      console.error("❌ Module save failed:", err);
      alert("Failed to save module.");
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(courseSearch.toLowerCase()) &&
      !formData.course_ids.includes(c.id)
  );

  const filteredSkills = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !formData.skill_ids.includes(s.id)
  );

  if (!orgId) {
    return (
      <div className="p-6 text-red-500">
        Organisation context is not available. Please try again later.
      </div>
    );
  }

  return (
    <Dialog open={visible} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold mb-4">
            {existingModule ? "Edit Module" : "Create Module"}
          </Dialog.Title>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Module Name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              className="w-full border p-2 rounded"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              className="w-full border p-2 rounded"
            />

            {/* Courses */}
            <div>
              <label className="font-semibold">Courses</label>
              <div className="flex flex-wrap gap-2 my-2">
                {formData.course_ids.map((id) => {
                  const course = courses.find((c) => c.id === id);
                  return (
                    <span
                      key={id}
                      className="bg-blue-100 dark:bg-blue-800 text-sm px-2 py-1 rounded flex items-center"
                    >
                      {course?.name}
                      <button
                        onClick={() => toggleItem("course_ids", id)}
                        className="ml-1 text-red-500"
                      >
                        <FiX />
                      </button>
                    </span>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder="Search Courses"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="border p-2 rounded w-full mb-2"
              />
              <div className="grid grid-cols-2 gap-2">
                {filteredCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => toggleItem("course_ids", course.id)}
                    className="text-left p-2 border rounded hover:bg-blue-50 dark:hover:bg-gray-800"
                  >
                    <FiPlus className="inline-block mr-1" />
                    {course.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="font-semibold">Skills</label>
              <div className="flex flex-wrap gap-2 my-2">
                {formData.skill_ids.map((id) => {
                  const skill = skills.find((s) => s.id === id);
                  return (
                    <span
                      key={id}
                      className="bg-green-100 dark:bg-green-800 text-sm px-2 py-1 rounded flex items-center"
                    >
                      {skill?.name}
                      <button
                        onClick={() => toggleItem("skill_ids", id)}
                        className="ml-1 text-red-500"
                      >
                        <FiX />
                      </button>
                    </span>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder="Search Skills"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="border p-2 rounded w-full mb-2"
              />
              <div className="grid grid-cols-2 gap-2">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => toggleItem("skill_ids", skill.id)}
                    className="text-left p-2 border rounded hover:bg-green-50 dark:hover:bg-gray-800"
                  >
                    <FiPlus className="inline-block mr-1" />
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded border">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {existingModule ? "Update Module" : "Create Module"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
