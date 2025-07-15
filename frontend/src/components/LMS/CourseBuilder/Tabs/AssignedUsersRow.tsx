import { useRef, useState, useEffect } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import type { SelectedEntity } from "../../../../contexts/SelectedEntityContext";
import api from "../../../../utils/axiosInstance";

interface AssignedUser {
  id: number;
  assigned_at: string;
  completed_at?: string;
  due_date?: string; // ✅ New field
  status: "assigned" | "completed";
  user: {
    id: number;
    name: string;
    email: string;
  };
  course_id: string;
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
    const confirmed = confirm(`Remove ${assignment.user.name} from this course?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/learn/assigned-courses/${assignment.user.id}/${assignment.course_id}`);
      onDeleted?.();
    } catch (err) {
      console.error("Failed to delete assigned course", err);
      alert("Error deleting assigned course.");
    } finally {
      setDeleting(false);
      setOpenDropdown(null);
    }
  };

  return (
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
            <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100">
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
  );
}
