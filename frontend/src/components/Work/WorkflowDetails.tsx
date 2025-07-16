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
}

export default function LearnDetails({ setMainPage }: LearnDetailsProps) {
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
    },
    {
      key: "tasks",
      label: "Tasks",
      icon: <FiCheckSquare />,
      content: <Tasks setMainPage={setMainPage} />,
    },
    {
      key: "automations",
      label: "Automations",
      icon: <FiLink />,
      content: <Placeholder />,
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
    },
  ];

  return (
    <DetailsPage
      title="Work Centre"
      breadcrumbs={[]}
      tabs={tabConfig}
    />
  );
}
