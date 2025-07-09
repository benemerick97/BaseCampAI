// frontend/src/components/Admin/OrgDetails.tsx

import { useState, useEffect } from "react";
import axios from "axios";
import { FiUsers, FiInfo, FiSettings } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import DetailsPage from "../Shared/DetailsPage";
import UsersList from "./UsersList";
import Settings from "../Settings";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface Organisation {
  id: number;
  name: string;
  created_at: string;
}

interface OrgDetailsProps {
  setMainPage: (page: string) => void;
}

export default function OrgDetails({ setMainPage }: OrgDetailsProps) {
  const { user, token } = useAuth();
  const [org, setOrg] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      if (!user?.organisation?.id || !token) return;

      try {
        const res = await axios.get(`${BACKEND_URL}/organisations/${user.organisation.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrg(res.data);
      } catch (err) {
        console.error("Failed to load organisation details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgDetails();
  }, [user?.organisation?.id]);

  if (loading) return <div className="p-6">Loading organisation...</div>;
  if (!org) return <div className="p-6 text-red-500">Organisation not found.</div>;

  const tabConfig = [
    {
      key: "overview",
      label: "Overview",
      icon: <FiInfo />,
      content: (
        <div className="text-sm text-gray-700 space-y-4 p-4">
          <p><strong>Name:</strong> {org.name}</p>
          <p><strong>Created At:</strong> {new Date(org.created_at).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      key: "users",
      label: "Users",
      icon: <FiUsers />,
      content: <UsersList setMainPage={setMainPage} />
    },
        {
      key: "settings",
      label: "Settings",
      icon: <FiSettings />,
      content: <Settings />,
    },
  ];

  return (
    <DetailsPage
      title={org.name}
      breadcrumbs={[]}
      tabs={tabConfig}
    />
  );
}
