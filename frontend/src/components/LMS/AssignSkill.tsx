// frontend/src/components/LMS/AssignSkill.tsx

import { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import { useAuth } from "../../contexts/AuthContext";


interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface Skill {
  id: string;
  name: string;
}

export default function AssignSkill() {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const headers: Record<string, string> | undefined = orgId
    ? {
        "x-org-id": orgId,
      }
    : undefined;

  const [users, setUsers] = useState<User[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!headers) return;
      try {
        const [usersRes, skillsRes] = await Promise.all([
          api.get("/users/", {
            params: { org_id: orgId },
            headers,
          }),
          api.get("/skills", {
            params: { org_id: orgId },
            headers,
          }),
        ]);
        setUsers(usersRes.data.users || usersRes.data);
        setSkills(skillsRes.data);
      } catch (err) {
        console.error("Error fetching users/skills", err);
      }
    };
    fetchData();
  }, [orgId]);

  const handleAssign = async () => {
    if (!selectedUser || !selectedSkill || !headers) {
      setMessage("❌ Please select both a user and a skill.");
      return;
    }

    const payload = {
      user_id: selectedUser,
      skill_id: selectedSkill,
      assigned_by: user?.id,
    };

    try {
      await api.post(`/learn/assign-skill`, payload);
      setMessage("✅ Skill successfully assigned.");
    } catch (err: any) {
      console.error("Assignment failed", err);
      if (err?.response?.detail) {
        setMessage(`❌ ${err.response.detail}`);
      } else if (err?.message) {
        setMessage(`❌ ${err.message}`);
      } else {
        setMessage("❌ Failed to assign skill.");
      }
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Assign Skill to User</h2>

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
        <label className="block mb-1 font-semibold">Skill</label>
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select Skill --</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
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
