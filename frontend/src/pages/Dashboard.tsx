// src/pages/Dashboard.tsx

import React, { useState, Suspense } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import Main from "../components/Main";
import Header from "../components/Header";
import SubSidebar from "../components/SubSidebar";
import { PageRegistry } from "./PageRegistry";
import { SelectedEntityProvider } from "../contexts/SelectedEntityContext"; // ✅ Import

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [mainPage, setMainPage] = useState("chat");
  const [componentKey, setComponentKey] = useState(0);

  const { isSuperAdmin, isAdmin } = useAuth();

  const handleNavClick = (page: string) => {
    setActiveTab(page);

    if (!["projects", "learn", "work", "organisation"].includes(page)) {
      setMainPage(page);
      setComponentKey((prev) => prev + 1);
    }
  };

  const renderPage = () => {
    const PageComponent = PageRegistry[mainPage];

    if (!PageComponent) {
      return <div key={`default-${componentKey}`}>Select a page</div>;
    }

    if (["settings", "upload"].includes(mainPage) && !isAdmin) {
      return <div className="p-4">🔒 Access Denied: Admins only</div>;
    }

    if (mainPage === "organisation" && !isSuperAdmin) {
      return <div className="p-4">🔒 Access Denied: Super Admin only</div>;
    }

    const key = `${mainPage}-${componentKey}`;
    const props = {
      setMainPage,
      onNavClick: handleNavClick,
    };

    return (
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <PageComponent key={key} {...props} />
      </Suspense>
    );
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-100 overflow-hidden">
      <Header activePage={activeTab} onNavClick={handleNavClick} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activeTab}
          onNavClick={handleNavClick}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
        />
        {["projects", "learn", "work", "organisation"].includes(activeTab) && (
          <SubSidebar activeTab={activeTab} setMainPage={setMainPage} />
        )}
        <Main>{renderPage()}</Main>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <SelectedEntityProvider>
    <DashboardContent />
  </SelectedEntityProvider>
);

export default Dashboard;
