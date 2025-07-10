// frontend/src/components/LMS/SkillEvidenceUpload.tsx

import { useState } from "react";
import api from "../../utils/axiosInstance";
import { useAuth } from "../../contexts/AuthContext";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function SkillEvidenceUpload({
  onComplete = () => {},
}: {
  onComplete?: () => void;
}) {
  const { user } = useAuth();
  const { selectedEntity } = useSelectedEntity();
  const assignment = selectedEntity?.data;

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  if (!assignment?.skill?.id || !assignment?.id) {
    return <p className="p-6 text-red-600">Skill assignment not found.</p>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

    const handleUpload = async () => {
    if (!file || !user?.id) {
        setMessage("Please select a file.");
        return;
    }

    setUploading(true);
    setMessage("");

    try {
        // ✅ Log values before sending
        console.log("Uploading evidence with:", {
        file,
        user_id: user.id,
        skill_id: assignment.skill.id,
        });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_id", user.id.toString());
        formData.append("skill_id", assignment.skill.id.toString());

      const uploadRes = await api.post(
        `${BACKEND_URL}/learn/assigned_skills/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const fileUrl = uploadRes.data.url;

      // Step 2: Mark skill complete with the returned file URL
      await api.post(`${BACKEND_URL}/learn/complete-skill`, {
        user_id: user.id,
        skill_id: assignment.skill.id,
        evidence_file_url: fileUrl,
      });

      setMessage("✅ Evidence submitted successfully.");
      onComplete();
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("❌ Failed to upload evidence.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        Upload Evidence for <span className="text-blue-600">{assignment.skill.name}</span>
      </h2>

      <input
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileChange}
        className="block mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Submit Evidence"}
      </button>

      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
