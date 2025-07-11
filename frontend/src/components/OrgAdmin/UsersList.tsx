// src/pages/UsersList.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiUserX } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import Modal from "../UI/Modal";
import UserInviteForm from "./UserInviteForm";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";
import api from "../../utils/axiosInstance"; // ✅ Import your axios instance

interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
}

const fetchUsers = async (orgId: string, token: string): Promise<User[]> => {
  const res = await api.get(`/users`, {
    headers: {
      "x-org-id": orgId,
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.users || res.data;
};

const deleteUser = async ({
  userId,
  orgId,
  token,
}: {
  userId: number;
  orgId: string;
  token: string;
}) => {
  await api.delete(`/users/${userId}`, {
    headers: {
      "x-org-id": orgId,
      Authorization: `Bearer ${token}`,
    },
  });
};

const UsersList = ({ setMainPage }: { setMainPage: (page: string) => void }) => {
  const { user, token } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();
  const orgId = user?.organisation?.id?.toString() || "";
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", orgId],
    queryFn: () => fetchUsers(orgId!, token!),
    enabled: !!orgId && !!token,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ userId }: { userId: number }) =>
      deleteUser({ userId, orgId: orgId!, token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", orgId] });
    },
    onError: (err: any) => {
      alert(err.message);
    },
  });

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      {/* Search + Invite Row */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border px-3 py-2 rounded w-full max-w-sm text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
        >
          <FiPlus size={16} />
          Invite User
        </button>
      </div>

      {/* Table or Empty State */}
      {isLoading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : isError ? (
        <p className="text-red-600 text-sm">Error: {(error as Error).message}</p>
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
                <tr
                  key={userItem.id}
                  className="border-t hover:bg-blue-50 cursor-pointer"
                  onClick={() => {
                    setSelectedEntity({
                      type: "user",
                      id: userItem.id.toString(),
                      data: userItem,
                    });
                    setMainPage("userdetails");
                  }}
                >
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
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate({ userId: userItem.id });
                        }}
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
            queryClient.invalidateQueries({ queryKey: ["users", orgId] });
          }}
        />
      </Modal>
    </div>
  );
};

export default UsersList;
