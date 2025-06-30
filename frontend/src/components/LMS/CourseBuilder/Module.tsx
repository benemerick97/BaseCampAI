import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";
import ModuleRow from "./ModuleRow";
import LearnModal from "../LearnModal";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface Module {
  id: number;
  title: string;
  description?: string;
  created_date: string;
  organisation_id: number;
}

interface ModuleProps {
  setMainPage: (page: string) => void;
}

export default function Module({ setMainPage }: ModuleProps) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();

  const [modules, setModules] = useState<Module[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const fetchModules = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/modules/`, {
        params: { organisation_id: user?.organisation?.id },
      });
      setModules(response.data);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleAddOrEditModule = async (form: any) => {
    const payload = {
      title: form.title,
      description: form.description,
      organisation_id: user?.organisation?.id,
    };

    if (form.id) {
      await axios.put(`${BACKEND_URL}/modules/${form.id}`, payload);
    } else {
      await axios.post(`${BACKEND_URL}/modules/`, payload);
    }

    setShowModal(false);
    setFormData({});
    fetchModules();
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Delete this module?");
    if (confirmed) {
      await axios.delete(`${BACKEND_URL}/modules/${id}`, {
        params: { organisation_id: user?.organisation?.id },
      });
      fetchModules();
    }
  };

  const handleSelect = (id: number) => {
    setSelectedEntity({ type: "module", id });
    setMainPage("moduledetails");
  };

  const handleAddClick = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleEditClick = (module: Module) => {
    setFormData(module);
    setShowModal(true);
  };

  const renderRow = (
    module: Module,
    _openDropdown: number | null,
    _setOpenDropdown: (id: number | null) => void,
    _openEditModal: (item: Module) => void
  ) => (
    <ModuleRow
      module={module}
      onClick={() => handleSelect(module.id)}
      onEdit={handleEditClick}
      onDelete={handleDelete}
    />
  );

  return (
    <>
      <LearnListPage<Module>
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

      <LearnModal
        title="Module"
        visible={showModal}
        onClose={() => {
          setFormData({});
          setShowModal(false);
        }}
        onSubmit={handleAddOrEditModule}
        formData={formData}
        setFormData={setFormData}
        fields={[
          { label: "Title", key: "title" },
          { label: "Description", key: "description" },
        ]}
      />
    </>
  );
}
