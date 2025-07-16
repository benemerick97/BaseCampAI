// frontend/src/components/LMS/LearnDetails.tsx

import {
  FiGrid,
  FiBookOpen,
  FiLayers,
  FiUsers,
  FiUser,
} from "react-icons/fi";
import DetailsPage from "../Shared/DetailsPage";

// Tabs
import LMSDashboard from "./LMSDashboard";
import MyModules from "./Module/MyModules";
import MyCourses from "./CourseBuilder/MyCourses";
import MySkills from "./CourseBuilder/MySkills";
import Module from "./Module/Module";
import UsersList from "../OrgAdmin/UsersList";
import Course from "./CourseBuilder/Course";
import Skill from "./CourseBuilder/Skill";

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
      content: <LMSDashboard />,
    },
    {
      key: "my-courses",
      label: "My Courses",
      icon: <FiBookOpen />,
      content: <MyCourses setMainPage={setMainPage} />,
    },
    {
      key: "my-skills",
      label: "My Skills",
      icon: <FiBookOpen />,
      content: <MySkills setMainPage={setMainPage} />,
    },
    {
      key: "my-modules",
      label: "My Modules",
      icon: <FiLayers />,
      content: <MyModules setMainPage={setMainPage} />,
    },
    {
      key: "courses",
      label: "Courses",
      icon: <FiBookOpen />,
      content: <Course setMainPage={setMainPage} />,
      access: "admin",
    },
    {
      key: "skills",
      label: "Skills",
      icon: <FiBookOpen />,
      content: <Skill setMainPage={setMainPage} />,
      access: "admin",
    },
    {
      key: "modules",
      label: "Modules",
      icon: <FiLayers />,
      content: <Module setMainPage={setMainPage} />,
      access: "admin",
    },
    {
      key: "users",
      label: "Users",
      icon: <FiUser />,
      content: <UsersList setMainPage={setMainPage} />,
      access: "admin",
    },
    {
      key: "groups",
      label: "Groups",
      icon: <FiUsers />,
      content: <div className="p-4 text-sm text-gray-700">Group assignments and settings.</div>,
      access: "super_admin",
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
      title="Learning Centre"
      breadcrumbs={[]}
      tabs={visibleTabs}
    />
  );
}
