import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import {
  FiFileText,
  FiTool,
  FiClipboard,
  FiPackage,
  FiFolder,
} from "react-icons/fi";
import DetailsPage from "../../Shared/DetailsPage";

// Modular tabs
import DetailsTab from "../Tabs/DetailsTab";
import AssetsTab from "../Tabs/AssetsTab";
import EmptyTab from "../Tabs/EmptyTab";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface SiteDetailsProps {
  setMainPage: (page: string) => void;
}

export default function SiteDetails({ setMainPage }: SiteDetailsProps) {
  const { user } = useAuth();
  const { selectedEntity, clearSelectedEntity } = useSelectedEntity();
  const [site, setSite] = useState<any>(null);

  useEffect(() => {
    if (!selectedEntity || selectedEntity.type !== "site") return;

    axios
      .get(`${BACKEND_URL}/sites/${selectedEntity.id}`, {
        params: { organisation_id: user?.organisation?.id },
      })
      .then((res) => setSite(res.data))
      .catch((err) => console.error("Error fetching site details:", err));
  }, [selectedEntity]);

  if (!site) return <div className="p-6">Loading site details...</div>;

  const tabConfig = [
    {
      key: "details",
      label: "Details",
      icon: <FiFileText />,
      content: <DetailsTab data={site} />,
    },
    {
      key: "work-orders",
      label: "Work Orders",
      icon: <FiTool />,
      content: <EmptyTab label="Work Orders" />,
    },
    {
      key: "projects",
      label: "Projects",
      icon: <FiClipboard />,
      content: <EmptyTab label="Projects" />,
    },
    {
      key: "assets",
      label: "Assets",
      icon: <FiPackage />,
      content: (
        <AssetsTab
          siteId={site.id}
          organisationId={site.organisation_id}
          setMainPage={setMainPage}
        />
      ),
    },
    {
      key: "files",
      label: "Files",
      icon: <FiFolder />,
      content: <EmptyTab label="Files" />,
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
