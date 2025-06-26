import React, { useState } from "react";
import {
  FiMessageCircle,
  FiUpload,
  FiDatabase,
  FiGrid,
  FiSidebar,
  FiUsers,
  FiFolder,
  FiBookOpen,
  FiClipboard,
} from "react-icons/fi";
import { GrUserAdmin } from "react-icons/gr";
import clsx from "clsx"; // Optional for cleaner conditional classNames

interface SidebarProps {
  onNavClick: (page: string) => void;
  activePage: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavClick, activePage, isAdmin, isSuperAdmin }) => {
  const [expanded, setExpanded] = useState(false);

  const navItems = [
    { key: "chat", icon: <FiMessageCircle />, label: "Chat" },
    { key: "agents", icon: <FiGrid />, label: "Agents" },
    { key: "projects", icon: <FiFolder />, label: "Workspaces" },
    { key: "learn", icon: <FiBookOpen />, label: "Learn" },
    { key: "work", icon: <FiClipboard />, label: "Work" },
    { key: "upload", icon: <FiUpload />, label: "Upload" },
    { key: "knowledge", icon: <FiDatabase />, label: "Knowledge" },
    { key: "organisation", icon: <FiUsers />, label: "Organisation" },
    { key: "controlpanel", icon: <GrUserAdmin />, label: "Control Panel" },
  ];

  // Filter out "agents" if not admin or superadmin
  const visibleNavItems = navItems.filter((item) => {
  if (item.key === "agents" && !isAdmin) return false;
  if (item.key === "controlpanel" && !isSuperAdmin) return false;
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
          {expanded}
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex flex-col gap-2 px-2">
        {visibleNavItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavClick(item.key)}
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
