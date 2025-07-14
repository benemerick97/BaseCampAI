// src/components/UserInviteForm.tsx

import { useState } from "react";
import api from "../../utils/axiosInstance";

interface UserInviteFormProps {
  onSuccess: () => void;
}

export default function UserInviteForm({ onSuccess }: UserInviteFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "user",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/users/invite", formData);
      onSuccess();
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Invite failed";
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="text"
        name="first_name"
        placeholder="First Name"
        value={formData.first_name}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="text"
        name="last_name"
        placeholder="Last Name"
        value={formData.last_name}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="password"
        name="password"
        placeholder="Temporary Password"
        value={formData.password}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded"
      />
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Send Invite
      </button>
    </form>
  );
}
