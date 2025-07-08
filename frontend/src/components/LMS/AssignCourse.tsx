import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface Course {
  id: string;
  name: string;
}

export default function AssignCourse() {
  const { user, token } = useAuth();

  const orgId = user?.organisation?.id?.toString();

  const headers: Record<string, string> | undefined =
    orgId && token
      ? {
          "x-org-id": orgId,
          Authorization: `Bearer ${token}`,
        }
      : undefined;

  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!headers) return;
      try {
        const [usersRes, coursesRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/users/`, {
            params: { org_id: orgId },
            headers,
          }),
          axios.get(`${BACKEND_URL}/courses/`, {
            params: { org_id: orgId },
            headers,
          }),
        ]);
        setUsers(usersRes.data.users || usersRes.data); // support both array and object format
        setCourses(coursesRes.data);
      } catch (err) {
        console.error("Error fetching users/courses", err);
      }
    };
    fetchData();
  }, [orgId]);

    const handleAssign = async () => {
    if (!selectedUser || !selectedCourse || !headers) {
        setMessage("❌ Please select both a user and a course.");
        return;
    }

    const payload = {
        user_id: selectedUser,
        course_id: selectedCourse,
        assigned_by: user?.id, // ensure string
    };

    console.log("Sending payload:", payload);

    try {
        await axios.post(`${BACKEND_URL}/learn/assign-course`, payload, {
        headers,
        });
        setMessage("✅ Course successfully assigned.");
    } catch (err) {
        console.error("Assignment failed", err);
        if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setMessage(`❌ ${err.response.data.detail}`);
        } else {
        setMessage("❌ Failed to assign course.");
        }
    }
    };


  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Assign Course to User</h2>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">User</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.first_name || u.last_name
                ? `${u.first_name ?? ""} ${u.last_name ?? ""}`
                : u.email}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Course</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAssign}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Assign
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
