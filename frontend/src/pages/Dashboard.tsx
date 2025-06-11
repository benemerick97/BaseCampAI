// src/pages/Dashboard.tsx

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import Main from "../components/Main";
import Chat from "../components/Chat";
import Settings from "../components/Settings";
import FileUpload from "../components/FileUpload";
import Header from "../components/Header";
import Placeholder from "../components/Placeholder";
import Agents from "../components/Agents";
import Knowledge from "../components/Knowledge";
import Organisation from "../components/Organisation";
import Projects from "../components/Projects";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("chat");
  const [componentKey, setComponentKey] = useState(0);
  const { isSuperAdmin, isAdmin, isUser } = useAuth();

  const handleNavClick = (page: string) => {
    if (page === activePage) {
      setComponentKey((prev) => prev + 1);
    } else {
      setActivePage(page);
      setComponentKey((prev) => prev + 1);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "chat":
        return <Chat key={`chat-${componentKey}`} />;

      case "settings":
        return isAdmin ? (
          <Settings key={`settings-${componentKey}`} />
        ) : (
          <div className="p-4">🔒 Access Denied: Admins only</div>
        );

      case "upload":
        return isAdmin ? (
          <FileUpload key={`upload-${componentKey}`} />
        ) : (
          <div className="p-4">🔒 Access Denied: Admins only</div>
        );

      case "organisation":
        return isSuperAdmin ? (
          <Organisation key={`organisation-${componentKey}`} />
        ) : (
          <div className="p-4">🔒 Access Denied: Super Admin only</div>
        );

      case "agents":
        return isSuperAdmin ? (
          <Agents key={`agents-${componentKey}`} />
        ) : (
          <div className="p-4">🔒 Access Denied: Super Admin only</div>
        );

      case "knowledge":
        return (
          <Knowledge key={`knowledge-${componentKey}`} onNavClick={handleNavClick} />
        );

      case "placeholder":
        return <Placeholder key={`placeholder-${componentKey}`} />;

      case "projects":
        return isAdmin ? (
          <Projects key={`Projects-${componentKey}`} />
        ) : (
          <div className="p-4">🔒 Access Denied: Admins only</div>
        );

      default:
        return <div key={`default-${componentKey}`}>Select a page</div>;
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <Header activePage={activePage} onNavClick={handleNavClick} />

      {/* Sidebar + Main content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavClick={handleNavClick} />
        <Main>{renderPage()}</Main>
      </div>
    </div>
  );
};

export default Dashboard;
