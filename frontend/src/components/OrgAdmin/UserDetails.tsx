// frontend/src/components/Admin/UserDetails.tsx

import { useEffect, useState } from "react";
import { FiUser, FiBookOpen, FiClock, FiSettings } from "react-icons/fi";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";
import DetailsPage from "../Shared/DetailsPage";
import api from "../../utils/axiosInstance";
import AccountSettings from "./AccountSettings";
import UserAssignedTraining from "./UserAssignedTraining";

interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
}

interface UserDetailsProps {
  setMainPage: (page: string) => void;
}

export default function UserDetails({ setMainPage }: UserDetailsProps) {
  const { selectedEntity, clearSelectedEntity } = useSelectedEntity();
  const [userDetails, setUserDetails] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!selectedEntity || selectedEntity.type !== "user") return;

      try {
        const res = await api.get(`/users/${selectedEntity.id}`);
        setUserDetails(res.data);
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };

    fetchUser();
  }, [selectedEntity]);

  if (!selectedEntity || selectedEntity.type !== "user") {
    return <div className="p-6 text-gray-600">No user selected.</div>;
  }

  if (!userDetails) {
    return <div className="p-6 text-gray-600">Loading user details...</div>;
  }

  const tabConfig = [
    {
      key: "overview",
      label: "Overview",
      icon: <FiUser />,
      content: (
        <div className="text-sm text-gray-700 space-y-4 p-4">
          <p><strong>Full Name:</strong> {(userDetails.first_name ?? "") + " " + (userDetails.last_name ?? "")}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Role:</strong> {userDetails.role}</p>
        </div>
      ),
    },
    {
      key: "training",
      label: "Training",
      icon: <FiBookOpen />,
      content: (
        <UserAssignedTraining
          userId={userDetails.id.toString()}
          setMainPage={setMainPage}
        />
      ),
    },

    {
      key: "activity",
      label: "Activity",
      icon: <FiClock />,
      content: <p className="p-4 text-gray-500 text-sm">Recent activity will be shown here.</p>,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <FiSettings />,
      content: <AccountSettings user={userDetails} />,
    },
  ];

  return (
    <DetailsPage
      title={`${userDetails.first_name ?? ""} ${userDetails.last_name ?? ""}`.trim() || userDetails.email}
      breadcrumbs={[
        {
          label: "Users",
          onClick: () => {
            clearSelectedEntity();
            setMainPage("orgdetails");
          },
        },
        { label: userDetails.email },
      ]}
      tabs={tabConfig}
    />
  );
}
