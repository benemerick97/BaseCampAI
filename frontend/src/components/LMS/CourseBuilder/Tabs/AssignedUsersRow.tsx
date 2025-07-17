import { useRef, useState, useEffect } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import type { SelectedEntity } from "../../../../contexts/SelectedEntityContext";
import api from "../../../../utils/axiosInstance";

interface AssignedUser {
  id: number;
  assigned_at: string;
  completed_at?: string;
  due_date?: string;
  status: "assigned" | "completed" | "overdue" | "expired";
  user: {
    id: number;
    name: string;
    email: string;
  };
  course_id?: string;
  skill_id?: string;
  module_id?: string;
}

interface Props {
  assignment: AssignedUser;
  setMainPage?: ((page: string) => void) | React.Dispatch<React.SetStateAction<any>>;
  setSelectedEntity: (entity: SelectedEntity) => void;
  onDeleted?: () => void;
}

export default function AssignedUsersRow({
  assignment,
  setMainPage,
  setSelectedEntity,
  onDeleted,
}: Props) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDueDate, setEditDueDate] = useState(assignment.due_date ?? "");
  const [editStatus, setEditStatus] = useState<AssignedUser["status"]>(assignment.status);
  const [saving, setSaving] = useState(false);

  const getTypeAndId = () => {
    if (typeof assignment.skill_id === "string") return { type: "skill", id: assignment.skill_id };
    if (typeof assignment.module_id === "string") return { type: "module", id: assignment.module_id };
    if (typeof assignment.course_id === "string") return { type: "course", id: assignment.course_id };
    return { type: null, id: null };
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown === assignment.id) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown, assignment.id]);

  const handleDelete = async () => {
    const { type, id } = getTypeAndId();
    if (!type || !id) return alert("Unknown assignment type");

    const confirmed = confirm(`Remove ${assignment.user.name} from this ${type}?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const endpoint = `/learn/assigned-${type}s/${assignment.user.id}/${id}`;
      await api.delete(endpoint);
      onDeleted?.();
    } catch (err) {
      console.error(`Failed to delete assigned ${type}`, err);
      alert(`Error deleting assigned ${type}.`);
    } finally {
      setDeleting(false);
      setOpenDropdown(null);
    }
  };

  const handleEdit = () => {
    setEditDueDate(assignment.due_date ?? "");
    setEditStatus(assignment.status);
    setShowEditModal(true);
    setOpenDropdown(null);
  };

  const handleSaveEdit = async () => {
    const { type, id } = getTypeAndId();
    if (!type || !id) return alert("Unknown assignment type");

    const payload = {
      user_id: assignment.user.id,
      [`${type}_id`]: id,
      due_date: editDueDate ? editDueDate : undefined,
      status: editStatus,
    };

    try {
      setSaving(true);
      await api.patch(`/learn/assigned-${type}s`, payload);
      setShowEditModal(false);
      onDeleted?.(); // refetch assignments
    } catch (err) {
      console.error("Failed to update assignment:", err);
      alert("Error saving changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <tr
        key={assignment.id}
        className="border-b hover:bg-gray-100"
        onClick={() => {
          if (assignment.user?.id) {
            setSelectedEntity({ type: "user", id: assignment.user.id });
            setMainPage?.("userdetails");
          }
        }}
      >
        <td className="px-4 py-2">{assignment.user?.name || "Unnamed"}</td>
        <td className="px-4 py-2 capitalize">{assignment.status}</td>
        <td className="px-4 py-2">{new Date(assignment.assigned_at).toLocaleDateString()}</td>
        <td className="px-4 py-2">
          {assignment.completed_at
            ? new Date(assignment.completed_at).toLocaleDateString()
            : "—"}
        </td>
        <td className="px-4 py-2">
          {assignment.due_date
            ? new Date(assignment.due_date).toLocaleDateString()
            : "—"}
        </td>
        <td
          className="px-4 py-3 border-r border-gray-100 text-right relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() =>
              setOpenDropdown((prev) => (prev === assignment.id ? null : assignment.id))
            }
          >
            <FiMoreHorizontal size={18} className="text-gray-600 hover:text-gray-800" />
          </button>
          {openDropdown === assignment.id && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-28 bg-white border rounded shadow z-10"
            >
              <button
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                onClick={handleEdit}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
              >
                {deleting ? "Removing..." : "Delete"}
              </button>
            </div>
          )}
        </td>
      </tr>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Assignment</h2>

            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded text-sm"
            />

            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={editStatus}
              onChange={(e) =>
                setEditStatus(e.target.value as AssignedUser["status"])
              }
              className="w-full mb-4 px-3 py-2 border rounded text-sm"
            >
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
              {/* You can add "overdue" or "expired" if your system supports manual overrides */}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-1 rounded border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
