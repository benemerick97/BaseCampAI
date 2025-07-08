// frontend/src/components/LMS/SkillBuilder/Skill.tsx

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useSelectedEntity } from "../../../contexts/SelectedEntityContext";
import LearnListPage from "../LearnListPage";
import SkillRow from "./SkillRow";
import SkillCreate from "../SkillCreate";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface Skill {
  id: string;
  name: string;
  description?: string;
  evidence_required: boolean;
  org_id: number;
  created_at: string;
}

interface SkillProps {
  setMainPage: (page: string) => void;
}

export default function Skill({ setMainPage }: SkillProps) {
  const { user } = useAuth();
  const { setSelectedEntity } = useSelectedEntity();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editSkill, setEditSkill] = useState<Skill | null>(null);

  const fetchSkills = async () => {
    const orgId = user?.organisation?.id;
    if (!orgId) return;

    try {
      const res = await axios.get(`${BACKEND_URL}/skills`, {
        params: { org_id: orgId },
      });
      setSkills(res.data);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
    }
  };

  useEffect(() => {
    if (user?.organisation?.id) {
      fetchSkills();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/skills/${id}`, {
        headers: { "x-org-id": user?.organisation?.id },
      });
      fetchSkills();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSelect = (id: string | number) => {
    setSelectedEntity({ type: "skill", id });
    setMainPage("skilldetails");
  };

  const handleAddClick = () => {
    setEditSkill(null);
    setShowModal(true);
  };

  const handleEditClick = (skill: Skill) => {
    setEditSkill(skill);
    setShowModal(true);
  };

  const renderRow = (
    skill: Skill,
    _openDropdown: string | number | null,
    _setDropdownOpen: (id: string | number | null) => void,
    _openEditModal: (item: Skill) => void
  ) => (
    <SkillRow
      skill={skill}
      onClick={() => handleSelect(skill.id)}
      onEdit={() => handleEditClick(skill)}
      onDelete={handleDelete}
      setMainPage={setMainPage}
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
        columns={["Title", "Description", "Evidence Required", "Created", "Actions"]}
        addButtonLabel="Add"
        showSearchBar={true}
        onAddClick={handleAddClick}
      />

      <SkillCreate
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditSkill(null);
        }}
        onCreated={fetchSkills}
        existingSkill={editSkill ?? undefined}
      />
    </>
  );
}
