import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import {
  FiFileText,
  FiTool,
  FiClipboard,
  FiFolder,
  FiRss,
} from "react-icons/fi";
import DetailsPage from "../../Shared/DetailsPage";

// Modular tabs
import DetailsTab from "../Tabs/DetailsTab";
import EmptyTab from "../Tabs/EmptyTab";
import SensorsTab from "../Tabs/IoTSensorsTab";

interface AssetDetailsProps {
  setMainPage: (page: string) => void;
}

export default function AssetDetails({ setMainPage }: AssetDetailsProps) {
  const { user } = useAuth();
  const { selectedEntity, clearSelectedEntity } = useSelectedEntity();
  const [asset, setAsset] = useState<any>(null);

  useEffect(() => {
    if (!selectedEntity || selectedEntity.type !== "asset") return;

    axios
      .get(`https://basecampai.ngrok.io/assets/${selectedEntity.id}`, {
        params: { organisation_id: user?.organisation?.id },
      })
      .then((res) => setAsset(res.data))
      .catch((err) => console.error("Error fetching asset details:", err));
  }, [selectedEntity]);

  if (!asset) return <div className="p-6">Loading asset details...</div>;

  const tabConfig = [
    {
      key: "details",
      label: "Details",
      icon: <FiFileText />,
      content: <DetailsTab data={asset} />,
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
      key: "files",
      label: "Files",
      icon: <FiFolder />,
      content: <EmptyTab label="Files" />,
    },
    {
      key: "sensors",
      label: "IoT Sensors",
      icon: <FiRss />,
      content: <SensorsTab />,
    },
  ];

  return (
    <DetailsPage
      title={asset.name}
      breadcrumbs={[
        {
          label: "Assets",
          onClick: () => {
            clearSelectedEntity();
            setMainPage("assets");
          },
        },
        { label: asset.name },
      ]}
      tabs={tabConfig}
    />
  );
}
