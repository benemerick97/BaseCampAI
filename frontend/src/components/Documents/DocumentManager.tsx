import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiPlus,
  FiEye,
  FiMoreHorizontal,
  FiTrash2,
  FiArrowUpCircle,
  FiUserPlus,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import Modal from "../UI/Modal";
import DocumentUpload from "./DocumentUpload";
import PortalDropdown from "../UI/PortalDropdown"; // 👈 NEW
import api from "../../utils/axiosInstance";

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

const fetchDocuments = async (orgId: string): Promise<DocumentObject[]> => {
  const res = await api.get(`/document-objects`, {
    headers: { "x-org-id": orgId },
  });
  return res.data;
};

const deleteDocument = async ({
  id,
  orgId,
}: {
  id: string;
  orgId: string;
}): Promise<void> => {
  await api.delete(`/document-objects/${id}`, {
    headers: { "x-org-id": orgId },
  });
};

const DocumentManager = () => {
  const { user } = useAuth();
  const orgId = user?.organisation?.id?.toString() || "";
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const anchorRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const {
    data: documents = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["documents", orgId],
    queryFn: () => fetchDocuments(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", orgId] });
    },
    onError: (err: any) => {
      alert(`❌ ${err.message}`);
    },
  });

  const handleDelete = (documentId: string) => {
    if (!orgId) return;
    const confirmed = window.confirm("Are you sure you want to delete this document?");
    if (!confirmed) return;
    deleteMutation.mutate({ id: documentId, orgId });
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
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

      {isLoading ? (
        <p className="text-gray-500">Loading documents...</p>
      ) : isError ? (
        <div className="text-red-600 bg-red-100 border border-red-300 p-4 rounded text-sm">
          <strong>Error:</strong> {(error as Error).message}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border rounded bg-gray-50">
          <p className="text-lg font-medium">No documents found</p>
          <p className="text-sm mt-1">Uploaded documents will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto relative z-0">
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
                <tr key={doc.id} className="border-t hover:bg-gray-50 relative">
                  <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-900">
                    {doc.name}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
                    {doc.review_date || "—"}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-700">
                    {doc.versions.length}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      ref={(el) => {
                        anchorRefs.current[doc.id] = el;
                      }}
                      onClick={() =>
                        setOpenDropdown((prev) => (prev === doc.id ? null : doc.id))
                      }
                      className="text-gray-700 hover:text-black p-1"
                    >
                      <FiMoreHorizontal size={18} />
                    </button>

                    {openDropdown === doc.id && (
                      <PortalDropdown
                        anchorRef={{ current: anchorRefs.current[doc.id]! }}
                        onClose={() => setOpenDropdown(null)}
                      >
                        <button
                          onClick={() => {
                            console.log("View", doc.id);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                        >
                          <FiEye size={14} /> View
                        </button>
                        <button
                          onClick={() => {
                            console.log("Replace", doc.id);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                        >
                          <FiArrowUpCircle size={14} /> Replace
                        </button>
                        <button
                          onClick={() => {
                            console.log("Assign", doc.id);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                        >
                          <FiUserPlus size={14} /> Assign
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(doc.id);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600 w-full text-left"
                        >
                          <FiTrash2 size={14} /> Delete
                        </button>
                      </PortalDropdown>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
      >
        <DocumentUpload
          onUploadComplete={() => {
            setShowUploadModal(false);
            queryClient.invalidateQueries({ queryKey: ["documents", orgId] });
          }}
        />
      </Modal>
    </div>
  );
};

export default DocumentManager;
