// frontend/src/components/Knowledge.tsx

import { useState, useEffect } from "react";
import { FiUpload, FiPlus } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import Modal from "../components/Modal"; 
import FileUpload from "../components/FileUpload";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const headers: Record<string, string> | undefined = orgId
    ? { "x-org-id": orgId }
    : undefined;

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

  const handleDelete = async (filename: string) => {
    if (!headers) return;
    try {
      await fetch(`${BACKEND_URL}/files/${filename}`, {
        method: "DELETE",
        headers,
      });
      setFiles((prev) => prev.filter((f) => f.filename !== filename));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [orgId]);

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header + Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-semibold leading-tight">Knowledge Base</h3>
          <span className="text-sm text-gray-600">
            (1 - {filteredFiles.length} of {filteredFiles.length})
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
          >
            <FiPlus size={16} />
            Upload
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search all files"
          className="border px-3 py-2 rounded w-full max-w-sm text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="text-sm text-blue-600 font-medium">+ Add filter</button>
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <p className="text-gray-500">Loading files...</p>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border rounded bg-gray-50">
          <p className="text-lg font-medium">No files found</p>
          <p className="text-sm mt-1">Uploaded files will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 rounded-lg bg-white">
            <thead className="bg-gray-100 text-left text-gray-600 font-medium border-b border-gray-300">
              <tr>
                <th className="px-4 py-2 border-r border-gray-200">Filename</th>
                <th className="px-4 py-2 border-r border-gray-200">Chunks</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.filename} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-900">
                    {file.filename}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
                    {file.chunks_indexed}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(file.filename)}
                      className="bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload File"
      >
        <FileUpload
          onUploadComplete={() => {
            setShowUploadModal(false);
            fetchFiles();
          }}
        />
      </Modal>
    </div>
  );
};

export default Knowledge;
