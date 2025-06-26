// src/pages/UsersList.tsx

import { useState, useEffect } from "react";
import { FiPlus, FiUserX } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import Modal from "./UI/Modal";
import UserInviteForm from "../components/UserInviteForm";

interface UsersListProps {
  onNavClick: (page: string) => void;
}

interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
}

const BACKEND_URL = "https://basecampai.ngrok.io";

const UsersList = ({ onNavClick }: UsersListProps) => {
  const { user, token } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const headers: Record<string, string> | undefined =
    orgId && token
      ? {
          "x-org-id": orgId,
          Authorization: `Bearer ${token}`,
        }
      : undefined;

  const fetchUsers = async () => {
    if (!headers) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users`, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to fetch users:", res.status, errorText);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUsers(data.users || data);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!headers) return;
    try {
      await fetch(`${BACKEND_URL}/users/${userId}`, {
        method: "DELETE",
        headers,
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [orgId]);

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-semibold leading-tight">Users</h3>
          <span className="text-sm text-gray-600">
            ({filteredUsers.length} total)
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
          >
            <FiPlus size={16} />
            Invite User
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border px-3 py-2 rounded w-full max-w-sm text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border rounded bg-gray-50">
          <p className="text-lg font-medium">No users found</p>
          <p className="text-sm mt-1">Invite users to populate this list.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 rounded-lg bg-white">
            <thead className="bg-gray-100 text-left text-gray-600 font-medium border-b border-gray-300">
              <tr>
                <th className="px-4 py-2 border-r border-gray-200">Name</th>
                <th className="px-4 py-2 border-r border-gray-200">Email</th>
                <th className="px-4 py-2 border-r border-gray-200">Role</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
            {filteredUsers.map((userItem) => (
                <tr key={userItem.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-900">
                    {(userItem.first_name ?? "") + " " + (userItem.last_name ?? "")}
                </td>
                <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
                    {userItem.email}
                </td>
                <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
                    {userItem.role}
                </td>
                <td className="px-4 py-3 text-right">
                    {userItem.role !== "super_admin" && (
                    <button
                        onClick={() => handleDelete(userItem.id)}
                        className="ml-auto bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700 flex items-center gap-1 justify-end"
                    >
                        <FiUserX size={14} />
                        Remove
                    </button>
                    )}
                </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite User"
      >
        <UserInviteForm
          onSuccess={() => {
            setShowInviteModal(false);
            fetchUsers();
          }}
        />
      </Modal>
    </div>
  );
};

export default UsersList;
