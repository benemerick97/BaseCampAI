// frontend/src/components/Header.tsx

import React, { useState, useRef, useEffect } from "react";
import { FiUser, FiSettings, FiChevronDown, FiBell } from "react-icons/fi";
import logo from "../../assets/logo/BASECAMP.svg";
import { useAuth } from "../../contexts/AuthContext";
import { useOrganisations } from "../../hooks/useOrganisations";

interface Organisation {
  id: number;
  name: string;
  short_name?: string;
}

interface HeaderProps {
  onNavClick: (page: string) => void;
  activePage: string;
}

const Header: React.FC<HeaderProps> = ({ onNavClick, activePage }) => {
  const { user, role, setRoleOverride, logout, refetchUser } = useAuth();
  const userName = user?.first_name || "User";
  const organisationName = user?.organisation?.name || "";
  const organisationId = user?.organisation?.id;
  const isSuperAdmin = user?.role === "super_admin";

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const { organisations, refetch: refetchOrganisations } = useOrganisations(isSuperAdmin);

  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const onChangeOrganisation = async (org: Organisation) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://basecampai.ngrok.io/superadmin/switch-org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ org_id: org.id }),
      });

      if (!response.ok) throw new Error("Failed to switch organisation");

      await refetchUser();
      setShowOrgDropdown(false);
    } catch (error) {
      console.error("Error switching organisation:", error);
    }
  };

  const handleOrgDropdownToggle = async () => {
    if (isSuperAdmin) {
      setShowOrgDropdown((prev) => !prev);
      await refetchOrganisations(); // ✅ Live refresh the org list
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(target)) {
        setShowAccountDropdown(false);
      }
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(target)) {
        setShowOrgDropdown(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(target)) {
        setShowRoleDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full h-12 bg-gray-100 flex items-center justify-between px-4 text-gray-700 z-10 relative">
      {/* Logo */}
      <div className="flex items-center w-40 h-10">
        <img src={logo} alt="Basecamp Logo" className="h-full object-contain" />
      </div>

      {/* Welcome */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-xl font-semibold">
        Welcome back {userName}!
      </div>

      {/* Right Controls */}
      <div className="flex gap-4 items-center h-full py-1 relative">
        {/* Organisation Dropdown */}
        {organisationName && (
          <div className="relative" ref={orgDropdownRef}>
            <button
              onClick={handleOrgDropdownToggle}
              className="flex items-center text-sm text-gray-600 font-medium max-w-[220px] truncate hover:text-gray-800"
            >
              {organisationName}
              {isSuperAdmin && <FiChevronDown className="ml-1 text-xs" />}
            </button>

            {isSuperAdmin && showOrgDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200">
                {organisations.length > 0 ? (
                  organisations.map((org, index) => {
                    const isFirst = index === 0;
                    const isLast = index === organisations.length - 1;
                    const isCurrent = org.id === organisationId;

                    return (
                      <button
                        key={org.id}
                        onClick={() => onChangeOrganisation(org)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          isCurrent ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                        } hover:bg-blue-100 transition-all duration-150 ${
                          isFirst ? "rounded-t-lg" : ""
                        } ${isLast ? "rounded-b-lg" : ""}`}
                      >
                        <span className="flex items-center justify-between">
                          {org.name}
                          {isCurrent && <span className="text-blue-600 text-xs ml-2">✓</span>}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No organisations found</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Role Dropdown for Super Admin */}
        {isSuperAdmin && (
          <div className="relative" ref={roleDropdownRef}>
            <button
              onClick={() => setShowRoleDropdown((prev) => !prev)}
              className="flex items-center text-sm text-gray-600 font-medium hover:text-gray-800"
            >
              Role: {role}
              <FiChevronDown className="ml-1 text-xs" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200">
                {["super_admin", "admin", "user"].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRoleOverride(
                        r === "super_admin" ? null : (r as "admin" | "user")
                      );
                      setShowRoleDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      role === r ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                    } hover:bg-blue-100 transition-all duration-150`}
                  >
                    {r === "super_admin" ? "Reset to Super Admin" : `Switch to ${r}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notification and Settings */}
        <button
          title="Notifications"
          onClick={() => onNavClick("placeholder")}
          className={`p-2 ${activePage === "placeholder" ? "text-blue-600" : "text-gray-600"}`}
        >
          <FiBell className="text-base" />
        </button>
        <button
          title="Settings"
          onClick={() => onNavClick("settings")}
          className={`p-2 ${activePage === "settings" ? "text-blue-600" : "text-gray-600"}`}
        >
          <FiSettings className="text-base" />
        </button>

        {/* Account Dropdown */}
        <div className="relative" ref={accountDropdownRef}>
          <button
            title="Account"
            onClick={() => setShowAccountDropdown((prev) => !prev)}
            className={`p-2 ${activePage === "account" ? "text-blue-600" : "text-gray-600"}`}
          >
            <FiUser className="text-base" />
          </button>

          {showAccountDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-md z-50">
              <button
                title="Account"
                onClick={() => onNavClick("account")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Account
              </button>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
