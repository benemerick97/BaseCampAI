import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";
import {
  FiFileText,
  FiTool,
  FiClipboard,
  FiPackage,
  FiFolder,
} from "react-icons/fi";
import DetailsPage from "./DetailsPage";

interface SiteDetailsProps {
  setMainPage: (page: string) => void;
}

export default function SiteDetails({ setMainPage }: SiteDetailsProps) {
  const { user } = useAuth();
  const { selectedEntity, clearSelectedEntity } = useSelectedEntity();
  const [site, setSite] = useState<any>(null);

  useEffect(() => {
    const fetchSite = async () => {
      if (!selectedEntity || selectedEntity.type !== "site") return;
      try {
        const response = await axios.get(
          `https://basecampai.ngrok.io/sites/${selectedEntity.id}`,
          {
            params: { organisation_id: user?.organisation?.id },
          }
        );
        setSite(response.data);
      } catch (error) {
        console.error("Error fetching site details:", error);
      }
    };

    fetchSite();
  }, [selectedEntity]);

  if (!site) return <div className="p-6">Loading site details...</div>;

  const emptyTab = (label: string) => (
    <div className="text-center py-10 text-sm text-gray-500 border rounded bg-gray-50">
      <p className="text-lg font-semibold mb-1">No {label} found</p>
      <p className="mb-2">
        This site doesn’t have any registered {label.toLowerCase()} yet.
      </p>
      <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
        Add {label.slice(0, -1)}
      </button>
    </div>
  );

  const detailsTab = (
    <div className="bg-white p-4 rounded-md border shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Name</p>
          <p className="text-gray-800 font-medium">{site.name}</p>
        </div>
        <div>
          <p className="text-gray-500">Location</p>
          <p className="text-gray-800 font-medium">{site.location || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Created</p>
          <p className="text-gray-800 font-medium">
            {new Date(site.created_date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Status</p>
          <p className="text-green-600 font-medium">Active</p>
        </div>
      </div>
    </div>
  );

  const tabConfig = [
    {
      key: "details",
      label: "Details",
      icon: <FiFileText />,
      content: detailsTab,
    },
    {
      key: "work-orders",
      label: "Work Orders",
      icon: <FiTool />,
      content: emptyTab("Work Orders"),
    },
    {
      key: "projects",
      label: "Projects",
      icon: <FiClipboard />,
      content: emptyTab("Projects"),
    },
    {
      key: "assets",
      label: "Assets",
      icon: <FiPackage />,
      content: emptyTab("Assets"),
    },
    {
      key: "files",
      label: "Files",
      icon: <FiFolder />,
      content: emptyTab("Files"),
    },
  ];

  return (
    <DetailsPage
      title={site.name}
      breadcrumbs={[
        {
          label: "Sites",
          onClick: () => {
            clearSelectedEntity();
            setMainPage("sites");
          },
        },
        { label: site.name },
      ]}
      tabs={tabConfig}
    />
  );
}
