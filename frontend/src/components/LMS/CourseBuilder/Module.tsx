// frontend/src/components/LMS/CourseBuilder/Module.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";
import ModuleRow from "./ModuleRow";
import LearnModal from "../LearnModal";

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
  const queryClient = useQueryClient();
  const orgId = user?.organisation?.id;

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const queryKey = ["modules", orgId];

  const {
    data: modules = [],
    isLoading,
  } = useQuery<Module[]>({
    queryKey,
    queryFn: async () => {
      const res = await api.get(`/modules/`, {
        params: { organisation_id: orgId },
      });
      return res.data;
    },
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
  });

  const upsertModule = useMutation({
    mutationFn: async (form: any) => {
      const payload = {
        title: form.title,
        description: form.description,
        organisation_id: orgId,
      };

      if (form.id) {
        return api.put(`/modules/${form.id}`, payload);
      } else {
        return api.post(`/modules/`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setShowModal(false);
      setFormData({});
    },
    onError: (err) => {
      console.error("Add/Edit failed:", err);
    },
  });


  const deleteModule = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/modules/${id}`, {
        params: { organisation_id: orgId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      console.error("Delete failed:", err);
    },
  });


  const handleAddOrEditModule = (form: any) => {
    upsertModule.mutate(form);
  };

  const handleDelete = (id: number) => {
    const confirmed = confirm("Delete this module?");
    if (confirmed) {
      deleteModule.mutate(id);
    }
  };

  const handleSelect = (id: string | number) => {
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
    _openDropdown: string | number | null,
    _setDropdownOpen: (id: string | number | null) => void,
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
        onFetch={() => queryClient.invalidateQueries({ queryKey })}
        onSelect={handleSelect}
        renderRow={renderRow}
        columns={["Title", "Description", "Created", "Actions"]}
        addButtonLabel="Add"
        showSearchBar={true}
        onAddClick={handleAddClick}
        isLoading={isLoading}
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
