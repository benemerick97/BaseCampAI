import { useEffect, useRef, useState } from "react";
import api from "../../utils/axiosInstance";

interface Organisation {
  id: number;
  name: string;
}

interface AdminCreateUserProps {
  organisations: Organisation[];
  onSuccess?: () => void;
  onCancel: () => void;
}

export default function AdminCreateUser({
  organisations,
  onSuccess,
  onCancel,
}: AdminCreateUserProps) {
  const [organisationId, setOrganisationId] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!organisationId || !email || !firstName || !lastName || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/superadmin/create-user", {
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        password,
        organisation_id: organisationId,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      const message =
        err.response?.data?.detail || "An error occurred while creating the user.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Create New User</h2>

      <select
        value={organisationId ?? ""}
        onChange={(e) => setOrganisationId(parseInt(e.target.value))}
        className="w-full border border-gray-300 p-2 rounded mb-3"
      >
        <option value="" disabled>
          Select Organisation
        </option>
        {organisations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>

      <input
        ref={inputRef}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-2"
      />
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-2"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-3"
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "user" | "admin")}
        className="w-full border border-gray-300 p-2 rounded mb-3"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`text-sm px-4 py-2 rounded text-white ${
            loading
              ? "bg-green-400 cursor-wait"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}
