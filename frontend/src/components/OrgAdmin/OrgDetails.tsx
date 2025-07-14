// frontend/src/components/Admin/OrgDetails.tsx

import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axiosInstance";
import { FiUsers, FiInfo, FiSettings } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import DetailsPage from "../Shared/DetailsPage";
import UsersList from "./UsersList";
import Settings from "../Settings";

interface Organisation {
  id: number;
  name: string;
  created_at: string;
}

interface OrgDetailsProps {
  setMainPage: (page: string) => void;
}

const fetchOrganisation = async (orgId: number): Promise<Organisation> => {
  const res = await api.get(`/organisations/${orgId}`);
  return res.data;
};

export default function OrgDetails({ setMainPage }: OrgDetailsProps) {
  const { user } = useAuth();
  const orgId = user?.organisation?.id;

  const {
    data: org,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["organisation", orgId],
    queryFn: () => fetchOrganisation(orgId!),
    enabled: !!orgId,
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
