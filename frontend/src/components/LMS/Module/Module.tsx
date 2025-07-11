import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";
import ModuleRow from "./ModuleRow";
import ModuleCreate from "./ModuleCreate";

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
  const { user, token } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();
  const queryClient = useQueryClient();

  // ✅ Log environment + base URL at runtime
  console.log("Module.tsx → VITE_API_URL:", import.meta.env.VITE_API_URL);
  console.log("Module.tsx → api.defaults.baseURL:", api.defaults.baseURL);

  // ✅ Hook to log all outgoing XHR and fetch calls
  useEffect(() => {
    const originalXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      console.log("🔍 OUTGOING XHR:", method, url);
      return originalXHR.apply(this, arguments as any);
    };

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      console.log("🔍 OUTGOING fetch:", args[0]);
      return originalFetch(...args);
    };

    return () => {
      XMLHttpRequest.prototype.open = originalXHR;
      window.fetch = originalFetch;
    };
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editModule, setEditModule] = useState<(ModuleFormData & { id?: string }) | null>(null);

  const orgId = user?.organisation?.id;
  const queryKey = ["modules", orgId];

  const {
    data: modules = [],
    isLoading,
    refetch,
  } = useQuery<ModuleListItem[]>({
    queryKey,
    queryFn: async () => {
      const res = await api.get("/learn/modules", {
        params: { org_id: orgId },
        headers: {
          Authorization: `Bearer ${token!}`,
        },
      });
      return res.data;
    },
    enabled: !!orgId && !!token,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/learn/modules/${id}`, {
        headers: {
          "x-org-id": orgId ?? "",
          Authorization: `Bearer ${token!}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      console.error("Delete failed:", err);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Delete this module?")) {
      deleteMutation.mutate(id);
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
      const res = await api.get<ModuleDetails>(`/learn/modules/${item.id}`, {
        headers: {
          "x-org-id": orgId ?? "",
          Authorization: `Bearer ${token!}`,
        },
      });

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
    />
  );

  return (
    <>
      <LearnListPage<ModuleListItem>
        title="Modules"
        entityType="module"
        items={modules}
        onFetch={async () => {
          await refetch();
        }}
        onSelect={handleSelect}
        renderRow={renderRow}
        columns={["Title", "Description", "Created", "Actions"]}
        addButtonLabel="Add"
        showSearchBar={true}
        onAddClick={handleAddClick}
        isLoading={isLoading}
      />

      <ModuleCreate
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditModule(null);
        }}
        onCreated={refetch}
        existingModule={editModule ?? undefined}
      />
    </>
  );
}