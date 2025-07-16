import React, { useState } from "react";
import {
  FiMessageCircle,
  //FiUpload,
  FiDatabase,
  FiGrid,
  FiSidebar,
  FiUsers,
  FiFolder,
  FiBookOpen,
  FiClipboard,
} from "react-icons/fi";
import { GrUserAdmin } from "react-icons/gr";
import clsx from "clsx";
import { useNavigate, useParams } from "react-router-dom";
import { GrConnect } from "react-icons/gr";
import { LuShieldPlus, LuSquareUser } from "react-icons/lu";
import { MdOutlineAccountBalance } from "react-icons/md";


interface SidebarProps {
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isAdmin, isSuperAdmin }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { page: activePage = "chat" } = useParams(); // Use URL to determine current page

  const navItems = [
    { key: "chat", icon: <FiMessageCircle />, label: "Chat" },
    { key: "agents", icon: <FiGrid />, label: "Agents" },
    { key: "projects", icon: <FiFolder />, label: "Workspaces" },
    { key: "learnhome", icon: <FiBookOpen />, label: "Learn" },
    { key: "workhome", icon: <FiClipboard />, label: "Work" },
    { key: "safetyhome", icon: <LuShieldPlus />, label: "Safety" },
    { key: "hrhome", icon: <LuSquareUser />, label: "HR" },
    { key: "financehome", icon: <MdOutlineAccountBalance />, label: "Finance" },
    { key: "documentmanager", icon: <FiDatabase />, label: "Documents" },
    { key: "automations", icon: <GrConnect />, label: "Automations" },
    { key: "orgdetails", icon: <FiUsers />, label: "Organisation" },
    { key: "controlpanel", icon: <GrUserAdmin />, label: "Control Panel" },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (["agents", "orgdetails"].includes(item.key) && !isAdmin) return false;
    if (["controlpanel", "safetyhome", "automations", "hrhome", "financehome" ].includes(item.key) && !isSuperAdmin) return false;
    return true;
  });

  return (
    <aside
      className={clsx(
        "h-full bg-gray-100 flex flex-col transition-all duration-300",
        expanded ? "w-52" : "w-16"
      )}
    >
      {/* Toggle Button */}
      <div className="px-2 py-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-white transition-all"
        >
          <span className="text-xl">
            <FiSidebar />
          </span>
          {expanded && <span>Toggle</span>}
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex flex-col gap-2 px-2">
        {visibleNavItems.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(`/dashboard/${item.key}`)}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
              activePage === item.key
                ? "bg-white shadow text-blue-600"
                : "text-gray-600 hover:bg-white"
            )}
          >
            <span className="text-xl">{item.icon}</span>
            {expanded && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
