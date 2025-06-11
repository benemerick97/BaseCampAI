import React, { useState, useRef, useEffect } from "react";
import { FiUser, FiSettings } from "react-icons/fi";
import logo from "../assets/logo/BASECAMP.svg";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onNavClick: (page: string) => void;
  activePage: string;
}

const Header: React.FC<HeaderProps> = ({ onNavClick, activePage }) => {
  const { user, logout } = useAuth();
  const userName = user?.email?.split("@")[0] || "User";
  const organisationName = user?.organisation?.name || "";

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
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

      {/* Centered Text */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-xl font-semibold">
        Welcome back {userName}!
      </div>

      {/* Settings + Account */}
      <div className="flex gap-4 items-center h-full py-1 relative" ref={dropdownRef}>
        {/* Organisation name */}
        {organisationName && (
          <span className="text-sm text-gray-600 font-medium truncate max-w-[150px]">
            {organisationName}
          </span>
        )}

        {/* Settings Button */}
        <button
          title="Settings"
          onClick={() => onNavClick("settings")}
          className={`p-2 ${activePage === "settings" ? "text-blue-600" : "text-gray-600"}`}
        >
          <FiSettings className="text-base" />
        </button>

        {/* Account Dropdown */}
        <div className="relative">
          <button
            title="Account"
            onClick={() => setShowDropdown((prev) => !prev)}
            className={`p-2 ${activePage === "account" ? "text-blue-600" : "text-gray-600"}`}
          >
            <FiUser className="text-base" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-md z-50">
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
