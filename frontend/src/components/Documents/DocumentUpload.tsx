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
  const [documentName, setDocumentName] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString() || "";

  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

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

    if (orgId) fetchAgents();
  }, [orgId]);

  const extractBaseName = (filename: string): string => {
    return filename.replace(/\.[^/.]+$/, "");
  };

  const formatSize = (size: number): string => {
    if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)} MB`;
    if (size >= 1_000) return `${(size / 1_000).toFixed(1)} KB`;
    return `${size} B`;
  };

  const handleFileSelect = (selected: File) => {
    if (!allowedTypes.includes(selected.type)) {
      setMessage("❌ Unsupported file type.");
      return;
    }
    setFile(selected);
    setDocumentName(extractBaseName(selected.name));
    setMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelect(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
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
        headers: { "org-id": orgId },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percent);
          }
        },
      });

      if (selectedAgent) {
        try {
          await api.post(
            `/agents/${selectedAgent}/documents`,
            { document_id: res.data.id },
            {
              headers: { "x-org-id": orgId },
            }
          );
        } catch (err) {
          console.warn("Agent assignment failed:", err);
        }
      }

      setMessage("✅ Document uploaded successfully.");
      resetForm();
      onUploadComplete?.();
    } catch (err: any) {
      console.error("Upload failed:", err);
      setMessage(`❌ Upload failed: ${err.message || err.toString()}`);
      setUploadProgress(null);
    }
  };

  const resetForm = () => {
    setFile(null);
    setDocumentName("");
    setReviewDate("");
    setSelectedAgent("");
    setUploadProgress(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-2xl shadow border border-dashed border-gray-300 text-center">
      <FiUploadCloud className="mx-auto text-4xl text-blue-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Upload New Document</h2>

      {!file ? (
        <>
          <p className="text-gray-500 mb-4">
            Drag and drop a <strong>PDF, Word (.doc/.docx), or Text</strong> file here, or use the button below.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-md p-6 mb-4 cursor-pointer ${
              dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
            }`}
          >
            <p className="text-sm text-gray-600">Drop your file here</p>
          </div>

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
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileChange}
          />
        </>
      ) : (
        <>
          <div className="text-sm text-gray-700 mt-2 mb-4 space-y-1">
            <p>📄 <strong>{file.name}</strong></p>
            <p>{formatSize(file.size)} — {file.type || "unknown type"}</p>
          </div>

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
            placeholder="Review Date"
            className="mb-3 w-full px-4 py-2 border rounded-md text-gray-700"
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

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Change File
            </button>

            <button
              onClick={handleUpload}
              disabled={!documentName.trim()}
              className={`px-5 py-2 rounded-md text-white transition-colors ${
                !documentName.trim() ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Upload
            </button>
          </div>
        </>
      )}

      {uploadProgress !== null && (
        <div className="w-full bg-gray-200 rounded h-2 mt-4 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {message && (
        <p className="mt-4 text-sm text-gray-600" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
};

export default DocumentUpload;
