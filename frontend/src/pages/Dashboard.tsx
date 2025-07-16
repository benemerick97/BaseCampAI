// src/pages/Dashboard.tsx

import { Suspense, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/UI/Sidebar";
import Main from "../components/Main";
import Header from "../components/UI/Header";
import SubSidebar from "../components/UI/SubSidebar";
import { PageRegistry } from "./PageRegistry";
import { SelectedEntityProvider } from "../contexts/SelectedEntityContext";
import { useParams, useNavigate } from "react-router-dom";

const DashboardContent = () => {
  const { page = "chat" } = useParams(); // page from URL (e.g. /dashboard/chat)
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin } = useAuth();

  const handleNavClick = (targetPage: string) => {
    navigate(`/dashboard/${targetPage}`);
  };

  // Redirect to default page if URL doesn't contain any
  useEffect(() => {
    if (!page) {
      navigate("/dashboard/chat", { replace: true });
    }
  }, [page, navigate]);

  const renderPage = () => {
    const PageComponent = PageRegistry[page];

    if (!PageComponent) {
      return <div className="p-4">Select a page</div>;
    }

    if (["settings", "upload"].includes(page) && !isAdmin) {
      return <div className="p-4">🔒 Access Denied: Admins only</div>;
    }

    if (page === "organisation" && !isSuperAdmin) {
      return <div className="p-4">🔒 Access Denied: Super Admin only</div>;
    }

    const props = {
      setMainPage: handleNavClick, // optional compatibility
      onNavClick: handleNavClick,
      isAdmin,
      isSuperAdmin,
    };

    return (
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <PageComponent key={page} {...props} />
      </Suspense>
    );
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-100 overflow-hidden">
      <Header activePage={page} onNavClick={handleNavClick} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />
        {["projects", "learn", "work", "organisation"].includes(page) && (
          <SubSidebar activeTab={page} setMainPage={handleNavClick} />
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
