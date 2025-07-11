import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/axiosInstance";

const Account: React.FC = () => {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return <div className="text-gray-500 text-sm text-center">Loading user data...</div>;
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(false);

    try {
      const response = await api.patch(`/users/${user.id}`, {
        first_name: firstName,
        last_name: lastName,
      });

      setUser({ ...user, ...response.data });
      setSuccess(true);
    } catch (err) {
      console.error("Failed to update user", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-gray-50 shadow-sm rounded-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">My Account</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
        <div>
          <label className="block font-medium text-gray-500 mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-500 mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <p className="font-medium text-gray-500">Role</p>
          <p className="capitalize">{user.role}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Organisation</p>
          <p>{user.organisation?.name || "—"}</p>
        </div>
        <div className="sm:col-span-2 text-center pt-2">
          <p className="text-xs text-gray-400">Email: {user.email}</p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        {success && <p className="text-green-600 text-sm mt-2">Changes saved successfully.</p>}
      </div>
    </div>
  );
};

export default Account;
