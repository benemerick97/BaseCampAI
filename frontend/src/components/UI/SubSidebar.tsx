import React from "react";
import ProjectsSidebar from "../subsidebars/ProjectsSidebar";
import LearnSidebar from "../subsidebars/LearnSidebar";
import WorkSidebar from "../subsidebars/WorkSidebar";
import OrgSidebar from "../subsidebars/OrgSidebar";
import DefaultSidebar from "../subsidebars/DefaultSidebar";

interface SubSidebarProps {
  activeTab: string;
  setMainPage: (page: string) => void;
}

const SubSidebar: React.FC<SubSidebarProps> = ({ activeTab, setMainPage }) => {
  const renderContent = () => {
    switch (activeTab) {
      case "projects":
        return <ProjectsSidebar setMainPage={setMainPage} />;
      case "learn":
        return <LearnSidebar setMainPage={setMainPage} />;
      case "work":
        return <WorkSidebar setMainPage={setMainPage} />;
      case "organisation":
        return <OrgSidebar setMainPage={setMainPage} />;
      default:
        return <DefaultSidebar />;
    }
  };

  return (
    <div className="w-60 bg-grey-100 border-gray-200 px-4 py-5 text-sm">
      {renderContent()}
    </div>
  );
};

export default SubSidebar;
