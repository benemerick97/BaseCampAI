import React, { useEffect, useState } from "react";
import AdminCreateOrg from "./AdminCreateOrg";
import AdminCreateUser from "./AdminCreateUser";
import AdminModal from "./AdminModal";

interface Organisation {
  id: number;
  name: string;
}

export default function ControlPanel() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const fetchOrgs = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("https://basecampai.ngrok.io/superadmin/organisations", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setOrganisations(data);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin Control Panel</h1>

      <div className="flex gap-4 mb-6">
        {/* Create Organisation Button */}
        <button
          onClick={() => setShowOrgModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Organisation
        </button>

        {/* Create User Button */}
        <button
          onClick={() => setShowUserModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Create User
        </button>
      </div>

      {/* Organisation Modal */}
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

      {/* User Modal */}
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
