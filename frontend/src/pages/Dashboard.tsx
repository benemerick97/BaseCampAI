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
import Learn from "../components/LMS/Learn";
import Account from "../components/Account";
import SubSidebar from "../components/SubSidebar";
import WorkflowBuilder from "../components/Work/WorkflowBuilder";
import Workflow from "../components/Work/Workflow";
import WorkOrders from "../components/Work/WorkOrders";
import Assets from "../components/Work/Assets";
import Sites from "../components/Work/Sites";
import Tasks from "../components/Work/Tasks";
import Content from "../components/Work/Content";
import WorkProject from "../components/Work/Projects";



const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("chat");    // Sidebar highlight & sub-sidebar logic
  const [mainPage, setMainPage] = useState("chat");      // Main content area
  const [componentKey, setComponentKey] = useState(0);   // Forces component reloads

  const { isSuperAdmin, isAdmin } = useAuth();

  const handleNavClick = (page: string) => {
    setActiveTab(page);

    // Only update main content if not relying on sub-sidebar content
    if (page !== "projects" && page !== "learn" && page !== "work") {
      setMainPage(page);
      setComponentKey((prev) => prev + 1);
    }
  };

  const renderPage = () => {
    switch (mainPage) {
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
      case "knowledge":
        return (
          <Knowledge key={`knowledge-${componentKey}`} onNavClick={handleNavClick} />
        );
      case "agents":
        return <Agents key={`agents-${componentKey}`} />;
      case "placeholder":
        return <Placeholder key={`placeholder-${componentKey}`} />;
      case "learn":
        return isAdmin ? (
          <Learn key={`learn-${componentKey}`} />
        ) : (
          <div className="p-4">🔒 Access Denied: Admins only</div>
        );
      case "account":
        return <Account key={`account-${componentKey}`} onNavClick={handleNavClick} />;
      case "projects":
        return <Projects key={`projects-${componentKey}`} />;
      case "workflow_builder":
        return <WorkflowBuilder key={`workflow-${componentKey}`} />;
      case "workflow":
        return <Workflow key={`workflow-${componentKey}`} setMainPage={setMainPage} />;
      case "workorders":
        return <WorkOrders key={`workorders-${componentKey}`} setMainPage={setMainPage} />;
      case "assets":
        return <Assets key={`assets-${componentKey}`} setMainPage={setMainPage} />;
      case "sites":
        return <Sites key={`sites-${componentKey}`} setMainPage={setMainPage} />;
      case "tasks":
        return <Tasks key={`tasks-${componentKey}`} setMainPage={setMainPage} />;
      case "content":
        return <Content key={`content-${componentKey}`} setMainPage={setMainPage} />;
      case "workproject":
        return <WorkProject key={`workproject-${componentKey}`} setMainPage={setMainPage} />;
      default:
        return <div key={`default-${componentKey}`}>Select a page</div>;
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-100 overflow-hidden">
      <Header activePage={activeTab} onNavClick={handleNavClick} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activeTab} onNavClick={handleNavClick} />

        {/* Show sub-sidebar for specific tabs */}
        {["projects", "learn", "work"].includes(activeTab) && (
          <SubSidebar activeTab={activeTab} setMainPage={setMainPage} />
        )}

        <Main>{renderPage()}</Main>
      </div>
    </div>
  );
};

export default Dashboard;
