import { useEffect, useState } from "react";
import AdminCreateOrg from "./AdminCreateOrg";
import AdminCreateUser from "./AdminCreateUser";
import AdminModal from "./AdminModal";
import api from "../../utils/axiosInstance"; // ✅ Ensure correct relative path

interface Organisation {
  id: number;
  name: string;
}

export default function ControlPanel() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const fetchOrgs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/superadmin/organisations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrganisations(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch organisations:", err);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin Control Panel</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowOrgModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Organisation
        </button>

        <button
          onClick={() => setShowUserModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Create User
        </button>
      </div>

      {showOrgModal && (
        <AdminModal onClose={() => setShowOrgModal(false)}>
          <AdminCreateOrg
            onSuccess={() => {
              setShowOrgModal(false);
              fetchOrgs();
            }}
            onCancel={() => setShowOrgModal(false)}
          />
        </AdminModal>
      )}

      {showUserModal && (
        <AdminModal onClose={() => setShowUserModal(false)}>
          <AdminCreateUser
            organisations={organisations}
            onSuccess={() => setShowUserModal(false)}
            onCancel={() => setShowUserModal(false)}
          />
        </AdminModal>
      )}
    </div>
  );
}
