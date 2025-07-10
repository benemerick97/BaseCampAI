import { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";
import ModuleRow from "./ModuleRow";
import ModuleCreate from "./ModuleCreate";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface ModuleListItem {
  id: string;
  name: string;
  description?: string;
  org_id: string;
  document_id?: string;
  created_at: string;
}

interface ModuleDetails {
  id: string;
  name: string;
  description?: string;
  org_id: string;
  course_ids: string[];
  skill_ids: string[];
}

interface ModuleFormData {
  name?: string;
  description?: string;
  course_ids: string[];
  skill_ids: string[];
}

interface ModuleProps {
  setMainPage: (page: string) => void;
}

export default function Module({ setMainPage }: ModuleProps) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();

  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editModule, setEditModule] = useState<(ModuleFormData & { id?: string }) | null>(null);

  const fetchModules = async () => {
    const orgId = user?.organisation?.id;
    if (!orgId) return;

    try {
      const res = await api.get(`${BACKEND_URL}/learn/modules`, {
        params: { org_id: orgId },
      });
      setModules(res.data);
    } catch (err) {
      console.error("Failed to fetch modules:", err);
    }
  };

  useEffect(() => {
    if (user?.organisation?.id) {
      fetchModules();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this module?")) return;
    try {
      await api.delete(`${BACKEND_URL}/learn/modules/${id}`, {
        headers: { "x-org-id": user?.organisation?.id },
      });
      fetchModules();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSelect = (id: string | number) => {
    setSelectedEntity({ type: "module", id });
    setMainPage("moduledetails");
  };

  const handleAddClick = () => {
    setEditModule(null);
    setShowModal(true);
  };

  const handleEditClick = async (item: ModuleListItem) => {
    try {
      const res = await api.get<ModuleDetails>(
        `${BACKEND_URL}/learn/modules/${item.id}`,
        {
          headers: {
            "x-org-id": user?.organisation?.id,
          },
        }
      );

      const fullModule = res.data;

      setEditModule({
        id: fullModule.id,
        name: fullModule.name,
        description: fullModule.description,
        course_ids: fullModule.course_ids,
        skill_ids: fullModule.skill_ids,
      });

      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch full module details:", err);
      alert("Could not load module details for editing.");
    }
  };

  const renderRow = (
    module: ModuleListItem,
    _openDropdown: string | number | null,
    _setDropdownOpen: (id: string | number | null) => void,
    _openEditModal: (item: ModuleListItem) => void
  ) => (
    <ModuleRow
      module={module}
      onClick={() => handleSelect(module.id)}
      onEdit={() => handleEditClick(module)}
      onDelete={handleDelete}
      //setMainPage={setMainPage}
    />
  );

  return (
    <>
      <LearnListPage<ModuleListItem>
        title="Modules"
        entityType="module"
        items={modules}
        onFetch={fetchModules}
        onSelect={handleSelect}
        renderRow={renderRow}
        columns={["Title", "Description", "Created", "Actions"]}
        addButtonLabel="Add"
        showSearchBar={true}
        onAddClick={handleAddClick}
      />

      <ModuleCreate
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditModule(null);
        }}
        onCreated={fetchModules}
        existingModule={editModule ?? undefined}
      />
    </>
  );
}
