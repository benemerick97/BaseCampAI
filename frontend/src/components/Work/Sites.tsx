import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit3, FiUpload } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

interface SiteItem {
  id: number;
  name: string;
  location: string;
  created_date: string;
  organisation_id: number;
}

interface SiteProps {
  setMainPage: (page: string) => void;
}

export default function Sites({ setMainPage }: SiteProps) {
  const { user } = useAuth();
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const fetchSites = async () => {
    try {
      const response = await axios.get("https://basecampai.ngrok.io/sites/", {
        params: { organisation_id: user?.organisation?.id },
      });
      setSites(response.data);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("https://basecampai.ngrok.io/sites/", {
        name,
        location,
        organisation_id: user?.organisation?.id,
      });
      setShowModal(false);
      setName("");
      setLocation("");
      fetchSites(); // refresh list after adding
    } catch (error: any) {
      alert(`Failed to create site: ${error.response?.data?.detail || error.message}`);
    }
  };

  useEffect(() => {
    if (user?.organisation?.id) fetchSites();
  }, [user]);

  return (
    <div className="p-6 relative">
      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
            <h2 className="text-xl font-semibold mb-4">Add New Site</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Site Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-semibold leading-tight">Sites</h3>
          <span className="text-sm text-gray-600">(1 - {sites.length} of {sites.length})</span>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 border border-blue-600 text-blue-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-50">
            <FiEdit3 size={16} />
            Describe
          </button>
          <button className="flex items-center gap-1 border border-blue-600 text-blue-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-50">
            <FiUpload size={16} />
            Upload
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
          >
            <FiPlus size={16} />
            Add Site
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search all sites"
          className="border px-3 py-2 rounded w-full max-w-sm text-sm"
        />
        <button className="text-sm text-blue-600 font-medium">+ Add filter</button>
      </div>

      {/* TABLE */}
      {sites.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border rounded bg-gray-50">
          <p className="text-lg font-medium">No sites added yet</p>
          <p className="text-sm mt-1">Click "Add Site" to register your first one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 rounded-lg bg-white">
            <thead className="bg-gray-100 text-left text-gray-600 font-medium border-b border-gray-300">
              <tr>
                <th className="px-4 py-2 border-r border-gray-200">Site Name</th>
                <th className="px-4 py-2 border-r border-gray-200">Location</th>
                <th className="px-4 py-2 border-r border-gray-200 whitespace-nowrap">Date Created</th>
                <th className="px-4 py-2 border-r border-gray-200">Status</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-100 font-semibold text-gray-900">{site.name}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-700">{site.location}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-600">
                    {new Date(site.created_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-600">Active</td>
                  <td className="px-4 py-3 text-right">
                    <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
