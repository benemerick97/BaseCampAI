import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface KnowledgeProps {
  onNavClick: (page: string) => void;
}

interface FileMeta {
  filename: string;
  chunks_indexed: number;
  original_name?: string;
}

const BACKEND_URL = "https://basecampai.ngrok.io";

const Knowledge = ({ onNavClick }: KnowledgeProps) => {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  const headers: Record<string, string> | undefined = orgId
    ? { "x-org-id": orgId }
    : undefined;

  const getFileExtension = (filename: string): string =>
    filename.split(".").pop()?.toLowerCase() || "";

  const fetchFiles = async () => {
    if (!headers) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/files`, {
        method: "GET",
        headers,
      });
      const data = await res.json();
      setFiles(data.files);
    } catch (err) {
      console.error("Failed to load files:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async (filename: string) => {
    if (!headers) return;
    try {
      const res = await fetch(`${BACKEND_URL}/files/preview/${filename}`, {
        method: "GET",
        headers,
      });
      if (!res.ok) throw new Error("Preview fetch failed");
      const text = await res.text();
      setFilePreview(text);
    } catch (err) {
      console.error("Preview error:", err);
      setFilePreview("Unable to load preview.");
    }
  };

  const fetchPreviewToken = async (filename: string) => {
    if (!headers) return;
    try {
      const res = await fetch(`${BACKEND_URL}/files/token/${filename}`, {
        method: "GET",
        headers,
      });
      if (!res.ok) throw new Error("Token fetch failed");
      const data = await res.json();
      setPreviewToken(data.token);
    } catch (err) {
      console.error("Token fetch error:", err);
      setPreviewToken(null);
    }
  };

  const handleFileSelect = (filename: string) => {
    setSelectedFile(filename);
    setFilePreview(null);
    setPreviewToken(null);

    const ext = getFileExtension(filename);
    ext === "pdf" ? fetchPreviewToken(filename) : fetchPreview(filename);
  };

  const handleDelete = async (filename: string) => {
    if (!headers) return;
    try {
      await fetch(`${BACKEND_URL}/files/${filename}`, {
        method: "DELETE",
        headers,
      });
      setFiles((prev) => prev.filter((f) => f.filename !== filename));
      if (selectedFile === filename) {
        setSelectedFile(null);
        setFilePreview(null);
        setPreviewToken(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [orgId]);

  return (
    <div className="flex h-full w-full relative">
      {/* Upload Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => onNavClick("upload")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Upload
        </button>
      </div>

      {/* File List Panel */}
      <div className="w-1/3 border-r p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : files.length === 0 ? (
          <div className="text-center text-gray-500">
            <div className="text-3xl mb-2">📄</div>
            <p>No files found</p>
            <p className="text-sm mt-1">
              Files uploaded with OpenAI API will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {files.map((file) => (
              <li
                key={file.filename}
                className={`p-3 border rounded cursor-pointer flex justify-between items-center ${
                  selectedFile === file.filename ? "bg-blue-50" : "hover:bg-gray-100"
                }`}
                onClick={() => handleFileSelect(file.filename)}
              >
                <div>
                  <span className="truncate font-medium">{file.filename}</span>
                  <div className="text-xs text-gray-500">{file.chunks_indexed} chunks</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.filename);
                  }}
                  className="text-red-600 text-sm hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Preview Panel */}
      <div className="w-2/3 p-6 overflow-y-auto">
        {selectedFile ? (
          <div>
            <h2 className="text-lg font-semibold mb-2">Preview: {selectedFile}</h2>
            {getFileExtension(selectedFile) === "pdf" ? (
              previewToken ? (
                <iframe
                  src={`${BACKEND_URL}/files/preview/raw?token=${previewToken}`}
                  className="w-full h-[75vh] border rounded"
                  title="PDF Preview"
                />
              ) : (
                <p className="text-gray-500">Loading preview...</p>
              )
            ) : (
              <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap max-h-[70vh] overflow-y-auto">
                {filePreview || "Loading preview..."}
              </pre>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Select a file to view details.</p>
        )}
      </div>
    </div>
  );
};

export default Knowledge;
