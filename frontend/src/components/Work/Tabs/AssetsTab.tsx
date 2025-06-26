import React, { useEffect, useState } from "react";
import axios from "axios";
import AssetRow from "../Assets/AssetRow";
import EmptyTab from "./EmptyTab";
import EntityModal from "../Assets/EntityModal";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";

interface Asset {
  id: number;
  name: string;
  asset_type?: string;
  serial_number?: string;
  created_date: string;
  site_id: number;
  organisation_id: number;
}

interface AssetsTabProps {
  siteId: number;
  organisationId: number;
  onAddAsset?: () => void;
  setMainPage: (page: string) => void;
}

export default function AssetsTab({
  siteId,
  organisationId,
  setMainPage,
}: AssetsTabProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Asset>>({});
  const { setSelectedEntity } = useSelectedEntity();

  const fetchAssets = async () => {
    try {
      const res = await axios.get("https://basecampai.ngrok.io/assets", {
        params: { site_id: siteId, organisation_id: organisationId },
      });
      setAssets(res.data);
    } catch (err) {
      console.error("Error fetching site assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!siteId || !organisationId) return;
    fetchAssets();
  }, [siteId, organisationId]);

  const handleSubmit = async (form: Partial<Asset>) => {
    try {
      if (form.id) {
        await axios.put(`https://basecampai.ngrok.io/assets/${form.id}`, {
          ...form,
          site_id: siteId,
          organisation_id: organisationId,
        });
      } else {
        await axios.post("https://basecampai.ngrok.io/assets", {
          ...form,
          site_id: siteId,
          organisation_id: organisationId,
        });
      }
      setShowModal(false);
      setFormData({});
      fetchAssets();
    } catch (error) {
      console.error("Error saving asset:", error);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this asset?");
    if (!confirmed) return;

    try {
      await axios.delete(`https://basecampai.ngrok.io/assets/${id}`, {
        params: { organisation_id: organisationId },
      });
      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  const openAddModal = () => {
    setFormData({});
    setShowModal(true);
  };

  const openEditModal = (asset: Asset) => {
    setFormData(asset);
    setShowModal(true);
  };

  const handleRowClick = (assetId: number) => {
    setSelectedEntity({ type: "asset", id: assetId });
    setMainPage("assetdetails");
  };

  const modalFields = [
    { label: "Asset Name", key: "name" },
    { label: "Type", key: "asset_type" },
    { label: "Serial Number", key: "serial_number" },
  ];

  if (loading) {
    return <div className="text-sm text-gray-600 px-4 py-2">Loading assets...</div>;
  }

  if (assets.length === 0) {
    return <EmptyTab label="Assets" onAddClick={openAddModal} />;
  }

  return (
    <div className="p-4 space-y-2">
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="mb-2 px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Add Asset
        </button>
      </div>

      <table className="min-w-full bg-white border rounded-md shadow-sm text-sm">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="text-left px-4 py-2">Asset Name</th>
            <th className="text-left px-4 py-2">Type</th>
            <th className="text-left px-4 py-2">Serial Number</th>
            <th className="text-left px-4 py-2">Created</th>
            <th className="text-right px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <AssetRow
              key={asset.id}
              asset={asset}
              onClick={() => handleRowClick(asset.id)} // ✅ working with updated AssetRow
              onEdit={() => openEditModal(asset)}
              onDelete={() => handleDelete(asset.id)}
            />
          ))}
        </tbody>
      </table>

      <EntityModal
        title="Asset"
        visible={showModal}
        onClose={() => setShowModal(false)}
        fields={modalFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
