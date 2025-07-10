// frontend/src/components/Admin/OrgDetails.tsx

import { useQuery } from "@tanstack/react-query";
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

const fetchOrganisation = async (orgId: number, token: string): Promise<Organisation> => {
  const res = await axios.get(`${BACKEND_URL}/organisations/${orgId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export default function OrgDetails({ setMainPage }: OrgDetailsProps) {
  const { user, token } = useAuth();
  const orgId = user?.organisation?.id;

  const {
    data: org,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["organisation", orgId],
    queryFn: () => fetchOrganisation(orgId!, token!),
    enabled: !!orgId && !!token,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div className="p-6">Loading organisation...</div>;
  if (isError || !org) {
    const message = (error as Error)?.message || "Organisation not found.";
    return <div className="p-6 text-red-500">{message}</div>;
  }

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
      content: <UsersList setMainPage={setMainPage} />,
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
