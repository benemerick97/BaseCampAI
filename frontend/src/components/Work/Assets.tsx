// frontend/src/components/Work/Assets.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";
import EntityListPage from "./EntityListPage";
import AssetRow from "./AssetRow";
import EntityModal from "../Work/EntityModal"; // adjust path if needed

interface AssetItem {
  id: number;
  name: string;
  asset_type?: string;
  serial_number?: string;
  created_date: string;
  site_id: number;
  organisation_id: number;
}

interface SiteOption {
  id: number;
  name: string;
}

interface AssetProps {
  setMainPage: (page: string) => void;
}

export default function Assets({ setMainPage }: AssetProps) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();

  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [sites, setSites] = useState<SiteOption[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const fetchAssets = async () => {
    try {
      const response = await axios.get("https://basecampai.ngrok.io/assets/", {
        params: { organisation_id: user?.organisation?.id },
      });
      setAssets(response.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

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

  useEffect(() => {
    fetchAssets();
    fetchSites();
  }, []);

  const handleAddOrEditAsset = async (form: any) => {
    if (form.id) {
      await axios.put(`https://basecampai.ngrok.io/assets/${form.id}`, {
        name: form.name,
        asset_type: form.asset_type,
        serial_number: form.serial_number,
        site_id: form.site_id,
        organisation_id: user?.organisation?.id,
      });
    } else {
      await axios.post("https://basecampai.ngrok.io/assets/", {
        name: form.name,
        asset_type: form.asset_type,
        serial_number: form.serial_number,
        site_id: form.site_id,
        organisation_id: user?.organisation?.id,
      });
    }
    setShowModal(false);
    setFormData({});
    fetchAssets();
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Delete this asset?");
    if (confirmed) {
      await axios.delete(`https://basecampai.ngrok.io/assets/${id}`, {
        params: { organisation_id: user?.organisation?.id },
      });
      fetchAssets();
    }
  };

  const handleSelect = (id: number) => {
    setSelectedEntity({ type: "asset", id });
    setMainPage("assetdetails");
  };

  const handleAddClick = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleEditClick = (item: AssetItem) => {
    setFormData(item);
    setShowModal(true);
  };

  const renderRow = (
    asset: AssetItem,
    _openDropdown: number | null,
    _setOpenDropdown: (id: number | null) => void,
    _openEditModal: (item: AssetItem) => void
  ) => {
    return (
      <AssetRow
        asset={asset}
        onClick={() => handleSelect(asset.id)} 
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />
    );
  };

  return (
    <>
      <EntityListPage<AssetItem>
        title="Assets"
        entityType="asset"
        items={assets}
        onFetch={fetchAssets}
        onSelect={handleSelect}
        renderRow={renderRow}
        columns={["Asset Name", "Type", "Serial Number", "Date Created", "Actions"]}
        addButtonLabel="Add"
        showSearchBar={true}
        onAddClick={handleAddClick}
      />

      <EntityModal
        title="Asset"
        visible={showModal}
        onClose={() => {
          setFormData({});
          setShowModal(false);
        }}
        onSubmit={handleAddOrEditAsset}
        formData={formData}
        setFormData={setFormData}
        fields={[
          { label: "Asset Name", key: "name" },
          { label: "Type", key: "asset_type" },
          { label: "Serial Number", key: "serial_number" },
          {
            label: "Site",
            key: "site_id",
            type: "select",
            options: sites.map((site) => ({ label: site.name, value: site.id })),
          },
        ]}
      />
    </>
  );
}
