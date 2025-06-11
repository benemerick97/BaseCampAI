import { useState, useEffect } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../utils/apiFetch"; // ✅ make sure this path is correct

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [agents, setAgents] = useState<{ key: string; name: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await apiFetch(
          "https://basecampai.ngrok.io/agents",
          user?.organisation?.id.toString() || ""
        );
        const data = await res.json();
        setAgents(data.agents || []);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
        setAgents([]);
      }
    };

    if (user?.organisation?.id) {
      fetchAgents();
    }
  }, [user?.organisation?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedAgent) {
      setMessage("Please select both a file and an agent.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("agent_id", selectedAgent);
    formData.append("org_id", user?.organisation?.id.toString() || "");

    try {
      const response = await fetch("https://basecampai.ngrok.io/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("✅ File uploaded successfully.");
        setFile(null);
        setSelectedAgent("");
      } else {
        setMessage("❌ Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("⚠️ An error occurred while uploading.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-xl p-8 bg-white rounded-2xl shadow-md border border-dashed border-gray-300 text-center">
        <FiUploadCloud className="mx-auto text-4xl text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Upload Your Files</h2>
        <p className="text-gray-500 mb-4">
          Select an agent and upload documents relevant to their context.
        </p>

        {/* Agent Selector */}
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="mb-4 w-full px-4 py-2 border rounded-md text-gray-700"
        >
          <option value="">-- Select Agent --</option>
          {agents.map((agent) => (
            <option key={agent.key} value={agent.key}>
              {agent.name}
            </option>
          ))}
        </select>

        {/* File Selector */}
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-block px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          Select File
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />

        <div className="mt-4">
          {file && <p className="text-sm text-gray-700 mb-2">Selected: {file.name}</p>}
          <button
            onClick={handleUpload}
            className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Upload
          </button>
        </div>

        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
};

export default FileUpload;
