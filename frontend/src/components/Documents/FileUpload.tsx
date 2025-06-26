import { useState, useEffect } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../utils/apiFetch";

interface FileUploadProps {
  onUploadComplete?: () => void;
}

interface Agent {
  key: string;
  name: string;
  type: string;
}

const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await apiFetch(
          "https://basecampai.ngrok.io/agents",
          user?.organisation?.id?.toString() || ""
        );
        const data = await res.json();
        const filtered = (data.agents || []).filter((a: Agent) => a.type === "retrieval");
        setAgents(filtered);
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedAgent) {
      setMessage("Please select both a file and a retrieval agent.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("agent_id", selectedAgent);
    formData.append("org_id", user?.organisation?.id.toString() || "");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://basecampai.ngrok.io/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setMessage("✅ File uploaded successfully.");
        setFile(null);
        setSelectedAgent("");
        setUploadProgress(null);
        if (onUploadComplete) onUploadComplete();
      } else {
        setMessage("❌ Upload failed. Please try again.");
        setUploadProgress(null);
      }
    };

    xhr.onerror = () => {
      setMessage("⚠️ An error occurred while uploading.");
      setUploadProgress(null);
    };

    xhr.send(formData);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-2xl shadow border border-dashed border-gray-300 text-center">
      <FiUploadCloud className="mx-auto text-4xl text-blue-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Upload Your Files</h2>
      <p className="text-gray-500 mb-4">
        Select a <strong>retrieval agent</strong> and upload documents relevant to their context.
      </p>

      {/* Agent Selector */}
      <select
        value={selectedAgent}
        onChange={(e) => setSelectedAgent(e.target.value)}
        className="mb-4 w-full px-4 py-2 border rounded-md text-gray-700"
      >
        <option value="">-- Select Retrieval Agent --</option>
        {agents.map((agent) => (
          <option key={agent.key} value={agent.key}>
            {agent.name}
          </option>
        ))}
      </select>

      {/* Drag-and-Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-md p-4 mt-2 ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
        }`}
      >
        <p className="text-sm text-gray-600">
          Drag and drop a file here, or click “Select File”
        </p>
      </div>

      {/* File Selector */}
      <label
        htmlFor="file-upload"
        className="cursor-pointer inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
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

      {/* File Preview */}
      {file && (
        <p className="text-sm text-gray-700 mt-3 flex justify-center items-center gap-2">
          📄 {file.name}
        </p>
      )}

      {/* Upload Button */}
      <div className="mt-4">
        <button
          onClick={handleUpload}
          disabled={!file || !selectedAgent}
          className={`px-5 py-2 rounded-md text-white transition-colors ${
            !file || !selectedAgent
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Upload
        </button>
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div className="w-full bg-gray-200 rounded h-2 mt-4 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Message */}
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default FileUpload;
