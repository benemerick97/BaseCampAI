import { useEffect, useState } from "react";
import { FiPlus, FiEye } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import Modal from "../UI/Modal";
import DocumentUpload from "./DocumentUpload";

interface DocumentFile {
  id: string;
  file_path: string;
  original_filename: string;
  uploaded_at: string;
  version: number;
}

interface DocumentObject {
  id: string;
  name: string;
  org_id: string;
  review_date?: string;
  current_file_id?: string;
  created_at: string;
  updated_at: string;
  versions: DocumentFile[];
}

const BACKEND_URL = "https://basecampai.ngrok.io";

const DocumentManager = () => {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString();

  const [documents, setDocuments] = useState<DocumentObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/document-objects`, {
        headers: { "x-org-id": orgId },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Failed to fetch documents.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format.");
      }

      setDocuments(data);
    } catch (err: any) {
      console.error("Failed to fetch documents:", err);
      setError(err.message || "Unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [orgId]);

  const handleDelete = async (documentId: string) => {
    if (!orgId) return;
    const confirmed = window.confirm("Are you sure you want to delete this document?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${BACKEND_URL}/document-objects/${documentId}`, {
        method: "DELETE",
        headers: {
          "x-org-id": orgId,
        },
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      } else {
        const errorData = await res.json();
        alert(`❌ Failed to delete document: ${errorData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("❌ An error occurred while deleting the document.");
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-semibold leading-tight">Document Manager</h3>
          <span className="text-sm text-gray-600">
            (1 - {filteredDocs.length} of {filteredDocs.length})
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

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search documents"
          className="border px-3 py-2 rounded w-full max-w-sm text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="text-sm text-blue-600 font-medium">+ Add filter</button>
      </div>

      {/* Loading / Error / Table */}
      {loading ? (
        <p className="text-gray-500">Loading documents...</p>
      ) : error ? (
        <div className="text-red-600 bg-red-100 border border-red-300 p-4 rounded text-sm">
          <strong>Error:</strong> {error}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border rounded bg-gray-50">
          <p className="text-lg font-medium">No documents found</p>
          <p className="text-sm mt-1">Uploaded documents will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 rounded-lg bg-white">
            <thead className="bg-gray-100 text-left text-gray-600 font-medium border-b border-gray-300">
              <tr>
                <th className="px-4 py-2 border-r border-gray-200">Name</th>
                <th className="px-4 py-2 border-r border-gray-200">Review Date</th>
                <th className="px-4 py-2 border-r border-gray-200">Versions</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-900">
                    {doc.name}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
                    {doc.review_date || "—"}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
                    {doc.versions.length}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => console.log("View", doc.id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      <FiEye className="inline-block mr-1" /> View
                    </button>
                    <button
                      onClick={() => console.log("Replace", doc.id)}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Replace
                    </button>
                    <button
                      onClick={() => console.log("Assign", doc.id)}
                      className="text-yellow-600 hover:underline text-sm"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:underline text-sm"
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
        title="Upload Document"
      >
        <DocumentUpload
          onUploadComplete={() => {
            setShowUploadModal(false);
            fetchDocuments();
          }}
        />
      </Modal>
    </div>
  );
};

export default DocumentManager;
