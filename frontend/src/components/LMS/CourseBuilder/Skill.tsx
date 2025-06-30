import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";
import SkillRow from "./SkillRow";
import LearnModal from "../LearnModal";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface Skill {
  id: number;
  name: string;
  category?: string;
  description?: string;
  created_date: string;
  organisation_id: number;
}

interface SkillProps {
  setMainPage: (page: string) => void;
}

export default function Skill({ setMainPage }: SkillProps) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/skills/`, {
        params: { organisation_id: user?.organisation?.id },
      });
      setSkills(response.data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddOrEditSkill = async (form: any) => {
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      organisation_id: user?.organisation?.id,
    };

    if (form.id) {
      await axios.put(`${BACKEND_URL}/skills/${form.id}`, payload);
    } else {
      await axios.post(`${BACKEND_URL}/skills/`, payload);
    }

    setShowModal(false);
    setFormData({});
    fetchSkills();
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Delete this skill?");
    if (confirmed) {
      await axios.delete(`${BACKEND_URL}/skills/${id}`, {
        params: { organisation_id: user?.organisation?.id },
      });
      fetchSkills();
    }
  };

  const handleSelect = (id: number) => {
    setSelectedEntity({ type: "skill", id });
    setMainPage("skilldetails");
  };

  const handleAddClick = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleEditClick = (skill: Skill) => {
    setFormData(skill);
    setShowModal(true);
  };

  const renderRow = (
    skill: Skill,
    _openDropdown: number | null,
    _setOpenDropdown: (id: number | null) => void,
    _openEditModal: (item: Skill) => void
  ) => (
    <SkillRow
      skill={skill}
      onClick={() => handleSelect(skill.id)}
      onEdit={handleEditClick}
      onDelete={handleDelete}
    />
  );

  return (
    <>
      <LearnListPage<Skill>
        title="Skills"
        entityType="skill"
        items={skills}
        onFetch={fetchSkills}
        onSelect={handleSelect}
        renderRow={renderRow}
        columns={["Name", "Category", "Description", "Created", "Actions"]}
        addButtonLabel="Add"
        showSearchBar={true}
        onAddClick={handleAddClick}
      />

      <LearnModal
        title="Skill"
        visible={showModal}
        onClose={() => {
          setFormData({});
          setShowModal(false);
        }}
        onSubmit={handleAddOrEditSkill}
        formData={formData}
        setFormData={setFormData}
        fields={[
          { label: "Name", key: "name" },
          { label: "Category", key: "category" },
          { label: "Description", key: "description" },
        ]}
      />
    </>
  );
}
