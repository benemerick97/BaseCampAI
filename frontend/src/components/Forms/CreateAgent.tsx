import { useState, useEffect } from "react";

interface CreateAgentProps {
  initialValues?: {
    agent_key: string;
    name: string;
    description: string;
    prompt: string;
    type: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
  orgId: string;
}

const BACKEND_URL = "https://basecampai.ngrok.io";

export default function CreateAgent({
  initialValues,
  onCancel,
  onSuccess,
  orgId,
}: CreateAgentProps) {
  const [form, setForm] = useState({
    agent_key: "",
    name: "",
    description: "",
    prompt: "",
    type: "prompt",
  });
  const [loading, setLoading] = useState(false);
  const editingKey = initialValues?.agent_key ?? null;

  useEffect(() => {
    if (initialValues) {
      setForm(initialValues);
    }
  }, [initialValues]);

  const handleSubmit = async () => {
    setLoading(true);
    const method = editingKey ? "PUT" : "POST";
    const url = editingKey
      ? `${BACKEND_URL}/agents/${editingKey}`
      : `${BACKEND_URL}/agents/register`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "x-org-id": orgId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_key: form.agent_key,
          name: form.name,
          description: form.description,
          prompt: form.prompt,
          filter: { agent_id: form.agent_key },
          type: form.type,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Error: " + err.detail);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Save agent failed:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Agent Key"
        value={form.agent_key}
        onChange={(e) => setForm({ ...form, agent_key: e.target.value })}
        disabled={!!editingKey}
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Agent Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <textarea
        className="w-full border rounded px-3 py-2"
        placeholder="Prompt"
        value={form.prompt}
        onChange={(e) => setForm({ ...form, prompt: e.target.value })}
        rows={4}
      />
      <select
        className="w-full border rounded px-3 py-2"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      >
        <option value="prompt">Prompt Only</option>
        <option value="retrieval">Retrieval</option>
      </select>
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {loading
            ? editingKey
              ? "Updating..."
              : "Creating..."
            : editingKey
            ? "Update Agent"
            : "Save Agent"}
        </button>
      </div>
    </div>
  );
}
