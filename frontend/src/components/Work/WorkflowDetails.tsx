// frontend/src/components/Work/WorkflowDetails.tsx

import {
  FiGrid,
  FiMapPin, 
  FiPlay, 
  FiPackage, 
  FiPaperclip, 
  FiCheckSquare, 
  FiFileText, 
  FiList, 
  FiLink,
   } from "react-icons/fi";

import DetailsPage from "../Shared/DetailsPage";

// Tabs
import WorkflowDashboard from "./WorkflowDashboard";
import Workflow from "./Assets/Workflow";
import WorkOrders from "./Assets/WorkOrders";
import Projects from "./Assets/Projects";
import Tasks from "./Assets/Tasks";
import Assets from "./Assets/Assets";
import Sites from "./Assets/Sites";
import Content from "./Assets/Content";
import Placeholder from "../Placeholder";

interface LearnDetailsProps {
  setMainPage: (page: string) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export default function LearnDetails({ setMainPage, isAdmin, isSuperAdmin }: LearnDetailsProps) {
  const tabConfig = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <FiGrid />,
      content: <WorkflowDashboard />,
    },
    {
      key: "workflows",
      label: "Workflows",
      icon: <FiList />,
      content: <Workflow setMainPage={setMainPage} />,
    },
    {
      key: "workorders",
      label: "Work Orders",
      icon: <FiFileText />,
      content: <WorkOrders setMainPage={setMainPage} />,
    },
    {
      key: "projects",
      label: "Projects",
      icon: <FiPlay />,
      content: <Projects setMainPage={setMainPage} />,
      access: "admin",
    },
    {
      key: "tasks",
      label: "Tasks",
      icon: <FiCheckSquare />,
      content: <Tasks setMainPage={setMainPage} />,
      access: "admin",
    },
    {
      key: "automations",
      label: "Automations",
      icon: <FiLink />,
      content: <Placeholder />,
      access: "super_admin",
    },
    {
      key: "assets",
      label: "Assets",
      icon: <FiPackage />,
      content: <Assets setMainPage={setMainPage} />,
    },
    {
      key: "sites",
      label: "Sites",
      icon: <FiMapPin />,
      content: <Sites setMainPage={setMainPage} />,
    },
    {
      key: "content",
      label: "Content",
      icon: <FiPaperclip />,
      content: <Content setMainPage={setMainPage} />,
      access: "admin",
    },
  ];

    const visibleTabs = tabConfig.filter((tab) => {
    const access = tab.access;

    if (access === "admin" && !(isAdmin || isSuperAdmin)) return false;
    if (access === "super_admin" && !isSuperAdmin) return false;

    return true;
    });

  return (
    <DetailsPage
      title="Work Centre"
      breadcrumbs={[]}
      tabs={visibleTabs}
    />
  );
}
