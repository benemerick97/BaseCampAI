// frontend/src/components/Admin/AccountSettings.tsx

import { useState } from "react";
import api from "../../utils/axiosInstance";

interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  organisation?: {
    id: number;
    name: string;
  };
}

interface AccountSettingsProps {
  user: User;
  onSave?: () => void; // Optional callback if parent wants to refresh or notify
}

export default function AccountSettings({ user, onSave }: AccountSettingsProps) {
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(false);
    setError("");

    try {
      await api.patch(`/users/${user.id}`, {
        first_name: firstName,
        last_name: lastName,
        });

      setSuccess(true);
      if (onSave) onSave();
    } catch (err) {
      console.error("Failed to update user", err);
      setError("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.post(`/users/${user.id}/reset-password`);
      alert("Password reset email sent.");
    } catch (err) {
      console.error("Failed to send reset email", err);
      alert("Failed to send password reset email.");
    }
  };

  return (
    <div className="w-full max-w-xl bg-gray-50 shadow-sm rounded-lg p-6 border border-gray-200 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">User Settings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
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

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      {success && <p className="text-green-600 text-sm text-center">Changes saved successfully.</p>}

      <div className="text-center space-x-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        <button
          onClick={handleResetPassword}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
        >
          Reset Password
        </button>
      </div>

      <hr className="border-gray-300 my-4" />

      <div className="text-sm text-gray-500">
        <p className="font-medium mb-2">Additional Settings</p>
        <ul className="list-disc list-inside space-y-1">
          <li>🔒 Set 2FA (Coming Soon)</li>
          <li>🛑 Disable account (Coming Soon)</li>
          <li>⚙️ Manage permissions (Coming Soon)</li>
        </ul>
      </div>
    </div>
  );
}
