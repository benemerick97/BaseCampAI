import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";
import EntityListPage from "./EntityListPage";
import SiteRow from "./SiteRow";
import EntityModal from "../Work/EntityModal";

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
  const { setSelectedEntity } = useSelectedEntity();

  const [sites, setSites] = useState<SiteItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

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
    fetchSites();
  }, []);

  const handleAddOrEditSite = async (form: any) => {
    if (form.id) {
      await axios.put(`https://basecampai.ngrok.io/sites/${form.id}`, {
        name: form.name,
        location: form.location,
        organisation_id: user?.organisation?.id,
      });
    } else {
      await axios.post("https://basecampai.ngrok.io/sites/", {
        name: form.name,
        location: form.location,
        organisation_id: user?.organisation?.id,
      });
    }
    setShowModal(false);
    setFormData({});
    fetchSites();
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Delete this site?");
    if (confirmed) {
      await axios.delete(`https://basecampai.ngrok.io/sites/${id}`);
      fetchSites();
    }
  };

  const handleSelect = (id: number) => {
    setSelectedEntity({ type: "site", id });
    setMainPage("sitedetails");
  };

  const handleAddClick = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleEditClick = (item: SiteItem) => {
    setFormData(item);
    setShowModal(true);
  };

  const renderRow = (
    site: SiteItem,
    _openDropdown: number | null,
    _setOpenDropdown: (id: number | null) => void,
    _openEditModal: (item: SiteItem) => void
  ) => {
    return (
      <SiteRow
        site={site}
        onSelect={handleSelect}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />
    );
  };

  return (
    <>
      <EntityListPage<SiteItem>
        title="Sites"
        entityType="site"
        items={sites}
        onFetch={fetchSites}
        onSelect={handleSelect}
        renderRow={renderRow}
        columns={["Site Name", "Location", "Date Created", "Status", "Actions"]}
        addButtonLabel="Add"
        showSearchBar={true}
        onAddClick={handleAddClick}
      />

      <EntityModal
        title="Site"
        visible={showModal}
        onClose={() => {
          setFormData({});
          setShowModal(false);
        }}
        onSubmit={handleAddOrEditSite}
        formData={formData}
        setFormData={setFormData}
        fields={[
          { label: "Site Name", key: "name" },
          { label: "Location", key: "location" },
        ]}
      />
    </>
  );
}
