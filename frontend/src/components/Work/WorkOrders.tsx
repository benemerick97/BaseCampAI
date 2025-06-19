import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";
import EntityListPage from "./EntityListPage";
import WorkOrderRow from "./WorkOrderRow";
import EntityModal from "./EntityModal"; 

interface WorkOrder {
  id: number;
  title: string;
  description: string;
  status: string;
  asset_id: number;
  asset_name: string;
  start_date: string;
  due_date: string;
  category: string;
  organisation_id: number;
}

interface Asset {
  id: number;
  name: string;
}

interface WorkOrdersProps {
  setMainPage: (page: string) => void;
}

export default function WorkOrders({ setMainPage }: WorkOrdersProps) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkOrder>>({});

  const fetchWorkOrders = async () => {
    try {
      const res = await axios.get("https://basecampai.ngrok.io/workorders/", {
        params: { organisation_id: user?.organisation?.id },
      });
      setWorkOrders(res.data);
    } catch (err) {
      console.error("Error fetching work orders:", err);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await axios.get("https://basecampai.ngrok.io/assets/", {
        params: { organisation_id: user?.organisation?.id },
      });
      setAssets(res.data);
    } catch (err) {
      console.error("Error fetching assets:", err);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
    fetchAssets();
  }, []);

  const handleAddOrEdit = async (form: Partial<WorkOrder>) => {
    const payload = {
      ...form,
      organisation_id: user?.organisation?.id,
    };

    if (form.id) {
      await axios.put(`https://basecampai.ngrok.io/workorders/${form.id}`, payload);
    } else {
      await axios.post("https://basecampai.ngrok.io/workorders/", payload);
    }

    setShowModal(false);
    setFormData({});
    fetchWorkOrders();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this work order?")) {
      await axios.delete(`https://basecampai.ngrok.io/workorders/${id}`, {
        params: { organisation_id: user?.organisation?.id },
      });
      fetchWorkOrders();
    }
  };

  const handleSelect = (id: number) => {
    setSelectedEntity({ type: "workorder", id });
    setMainPage("workorderdetails");
  };

  const handleAddClick = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleEditClick = (item: WorkOrder) => {
    setFormData(item);
    setShowModal(true);
  };

  const renderRow = (
    workOrder: WorkOrder,
    _openDropdown: number | null,
    _setOpenDropdown: (id: number | null) => void,
    _openEditModal: (item: WorkOrder) => void
  ) => {
    return (
      <WorkOrderRow
        workOrder={workOrder}
        onClick={() => handleSelect(workOrder.id)}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />
    );
  };

  return (
    <>
      <EntityListPage<WorkOrder>
        title="Work Orders"
        entityType="workorder"
        items={workOrders}
        onFetch={fetchWorkOrders}
        onSelect={handleSelect}
        renderRow={renderRow}
        columns={["Title", "Description", "Status", "Asset", "Start Date", "Due Date", "Category", "Actions"]}
        addButtonLabel="Add"
        showSearchBar={true}
        onAddClick={handleAddClick}
      />

      <EntityModal
        title="Work Order"
        visible={showModal}
        onClose={() => {
          setFormData({});
          setShowModal(false);
        }}
        onSubmit={handleAddOrEdit}
        formData={formData}
        setFormData={setFormData}
        fields={[
          { label: "Title", key: "title" },
          { label: "Description", key: "description" },
          { label: "Status", key: "status" },
          {
            label: "Asset",
            key: "asset_id",
            type: "select",
            options: assets.map((a) => ({ label: a.name, value: a.id })),
          },
          { label: "Start Date", key: "start_date", type: "date" },
          { label: "Due Date", key: "due_date", type: "date" },
          { label: "Category", key: "category" },
        ]}
      />
    </>
  );
}
