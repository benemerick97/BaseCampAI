// frontend/src/components/Documents/DocumentUpload.tsx

import { useState, useEffect } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/axiosInstance";

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

interface Agent {
  key: string;
  name: string;
  type: string;
}

const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString() || "";

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get(`/agents`, {
          headers: { "x-org-id": orgId },
        });
        const filtered = (res.data.agents || []).filter((a: Agent) => a.type === "retrieval");
        setAgents(filtered);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
        setAgents([]);
      }
    };

    if (orgId) {
      fetchAgents();
    }
  }, [orgId]);

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
    if (!file || !documentName.trim()) {
      setMessage("Please provide a document name and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", documentName);
    if (reviewDate) formData.append("review_date", reviewDate);

    try {
      setUploadProgress(0);
      setMessage("Uploading...");

      const res = await api.post(`/document-objects`, formData, {
        headers: {
          "org-id": orgId,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      const data = res.data;

      // Optional: assign to agent
      if (selectedAgent) {
        try {
          await api.post(
            `/agents/${selectedAgent}/documents`,
            { document_id: data.id },
            {
              headers: {
                "x-org-id": orgId,
              },
            }
          );
        } catch (err) {
          console.warn("Agent assignment failed:", err);
        }
      }

      setMessage("✅ Document uploaded successfully.");
      setFile(null);
      setSelectedAgent("");
      setDocumentName("");
      setReviewDate("");
      setUploadProgress(null);
      if (onUploadComplete) onUploadComplete();
    } catch (error: any) {
      console.error("Upload failed:", error);
      setMessage(`❌ Upload failed: ${error.message || error.toString()}`);
      setUploadProgress(null);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-2xl shadow border border-dashed border-gray-300 text-center">
      <FiUploadCloud className="mx-auto text-4xl text-blue-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Upload New Document</h2>
      <p className="text-gray-500 mb-4">
        Enter a name, optionally select a retrieval agent, and upload a document file.
      </p>

      <input
        type="text"
        value={documentName}
        onChange={(e) => setDocumentName(e.target.value)}
        placeholder="Document name"
        className="mb-3 w-full px-4 py-2 border rounded-md text-gray-700"
      />

      <input
        type="date"
        value={reviewDate}
        onChange={(e) => setReviewDate(e.target.value)}
        className="mb-4 w-full px-4 py-2 border rounded-md text-gray-700"
      />

      <select
        value={selectedAgent}
        onChange={(e) => setSelectedAgent(e.target.value)}
        className="mb-4 w-full px-4 py-2 border rounded-md text-gray-700"
      >
        <option value="">-- Optional: Assign to Retrieval Agent --</option>
        {agents.map((agent) => (
          <option key={agent.key} value={agent.key}>
            {agent.name}
          </option>
        ))}
      </select>

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
        accept=".pdf"
        onChange={handleFileChange}
      />

      {file && (
        <p className="text-sm text-gray-700 mt-3 flex justify-center items-center gap-2">
          📄 {file.name}
        </p>
      )}

      <div className="mt-4">
        <button
          onClick={handleUpload}
          disabled={!file || !documentName.trim()}
          className={`px-5 py-2 rounded-md text-white transition-colors ${
            !file || !documentName.trim()
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Upload
        </button>
      </div>

      {uploadProgress !== null && (
        <div className="w-full bg-gray-200 rounded h-2 mt-4 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default DocumentUpload;
