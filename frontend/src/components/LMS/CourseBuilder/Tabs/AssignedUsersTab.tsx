// frontend/src/components/LMS/Tabs/AssignedUsersTab.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../contexts/AuthContext";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface AssignedUser {
  id: number;
  user_id: number;
  skill_id: string;
  assigned_by?: number;
  assigned_at: string;
  completed_at?: string;
  status: "assigned" | "completed";
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface AvailableUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

export default function AssignedUsersTab({ skillId }: { skillId: string }) {
  const { user, token } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const headers =
    orgId && token
      ? {
          "x-org-id": orgId,
          Authorization: `Bearer ${token}`,
        }
      : undefined;

  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [allUsers, setAllUsers] = useState<AvailableUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "assigned" | "completed">("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!headers) return;

    const fetchUsers = async () => {
      try {
        const assignedRes = await axios.get(
          `${BACKEND_URL}/learn/assigned-skills/by-skill/${skillId}`,
          { headers }
        );
        setAssignedUsers(assignedRes.data);

        const allRes = await axios.get(`${BACKEND_URL}/users`, {
          params: { org_id: orgId },
          headers,
        });
        const all = allRes.data.users || allRes.data;

        const unassigned = all.filter(
          (u: AvailableUser) => !assignedRes.data.some((a: AssignedUser) => a.user?.id === u.id)
        );

        setAllUsers(unassigned);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [orgId, skillId]);

  const handleAssign = async () => {
    if (!headers || !selectedUser?.id) return;

    try {
      await axios.post(
        `${BACKEND_URL}/learn/assign-skill`,
        {
          user_id: selectedUser.id,
          skill_id: skillId,
          assigned_by: user?.id,
        },
        { headers }
      );

      setMessage("✅ User assigned successfully.");
      setSelectedUser(null);
      setShowAssignModal(false);

      const assignedRes = await axios.get(
        `${BACKEND_URL}/learn/assigned-skills/by-skill/${skillId}`,
        { headers }
      );
      setAssignedUsers(assignedRes.data);

      const allRes = await axios.get(`${BACKEND_URL}/users`, {
        params: { org_id: orgId },
        headers,
      });
      const all = allRes.data.users || allRes.data;
      const unassigned = all.filter(
        (u: AvailableUser) =>
          !assignedRes.data.some((a: AssignedUser) => a.user?.id === u.id)
      );
      setAllUsers(unassigned);
    } catch (err) {
      console.error("Failed to assign user:", err);
      setMessage("❌ Failed to assign user.");
    }
  };

  const filteredUsers = assignedUsers.filter((u) => {
    const matchesSearch =
      u.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === "all" || u.status === filter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-4 text-gray-600">Loading assignments...</div>;

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search users"
            className="border px-3 py-1 rounded text-sm w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {["all", "assigned", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded text-sm border ${
                filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-800"
              }`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setShowAssignModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
        >
          + Assign User
        </button>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-gray-500">No users match your search or filter.</div>
      ) : (
        <table className="min-w-full text-sm border mb-6">
          <thead className="bg-gray-100 border-b text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Assigned</th>
              <th className="px-4 py-2">Completed</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="px-4 py-2">{a.user?.name || "Unnamed"}</td>
                <td className="px-4 py-2">{a.user?.email || "—"}</td>
                <td className="px-4 py-2 capitalize">{a.status}</td>
                <td className="px-4 py-2">{new Date(a.assigned_at).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  {a.completed_at ? new Date(a.completed_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Assign User to Skill</h2>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select user:
            </label>
            <select
              className="w-full px-3 py-2 border rounded text-sm mb-4"
              value={selectedUser?.id ?? ""}
              onChange={(e) => {
                const userId = Number(e.target.value);
                const user = allUsers.find((u) => u.id === userId) || null;
                setSelectedUser(user);
              }}
            >
              <option value="" disabled>
                -- Select a user --
              </option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name || user.last_name
                    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                    : user.email}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-1 rounded border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedUser}
                className="px-4 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
