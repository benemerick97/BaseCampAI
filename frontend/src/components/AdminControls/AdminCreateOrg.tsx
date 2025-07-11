import { useEffect, useRef, useState } from "react";
import api from "../../utils/axiosInstance";

interface AdminCreateOrgProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export default function AdminCreateOrg({ onSuccess, onCancel }: AdminCreateOrgProps) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !shortName.trim()) {
      setError("Both organisation name and short name are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/superadmin/create-org", {
        name,
        short_name: shortName,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      const message =
        err.response?.data?.detail || "An error occurred while creating the organisation.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Create New Organisation</h2>

      <input
        ref={inputRef}
        type="text"
        placeholder="Organisation name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-2"
      />

      <input
        type="text"
        placeholder="Short name (e.g. BHP, Rio, FMG)"
        value={shortName}
        onChange={(e) => setShortName(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-3"
      />

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
            loading ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}
