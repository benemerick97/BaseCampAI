import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";
import EntityListPage from "./EntityListPage";
import SiteRow from "./SiteRow";

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

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

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

  const renderRow = (
    site: SiteItem,
    _openDropdown: number | null,
    _setOpenDropdown: (id: number | null) => void,
    openEditModal: (item: SiteItem) => void
  ) => {
    return (
      <SiteRow
        site={site}
        onSelect={handleSelect}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />
    );
  };

  return (
    <EntityListPage<SiteItem>
      title="Sites"
      entityType="site"
      items={sites}
      onAdd={handleAddOrEditSite}
      onFetch={fetchSites}
      onSelect={handleSelect}
      renderRow={renderRow}
      columns={["Site Name", "Location", "Date Created", "Status", "Actions"]}
      modalFields={[
        { label: "Site Name", key: "name" },
        { label: "Location", key: "location" },
      ]}
      addButtonLabel="Add"
      showSearchBar={true}
    />
  );
}
