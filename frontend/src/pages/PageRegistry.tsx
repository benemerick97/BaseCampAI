// src/pages/PageRegistry.tsx

import Chat from "../components/Chat/Chat";
import Settings from "../components/OrgAdmin/Settings";
import FileUpload from "../components/Documents/FileUpload";
import Placeholder from "../components/Placeholder";
import Agents from "../components/Agents/Agents";
import Knowledge from "../components/Documents/Knowledge";
import Organisation from "../components/OrgAdmin/Organisation";
import Projects from "../components/Workspaces/Projects";
//import Learn from "../components/LMS/OLDLearn";
import Account from "../components/OrgAdmin/Account";
//import WorkflowBuilderContainer from "../components/Work/Builder/WorkflowBuilderContainer";
import Workflow from "../components/Work/Assets/Workflow";
import WorkOrders from "../components/Work/Assets/WorkOrders";
import Assets from "../components/Work/Assets/Assets";
import Sites from "../components/Work/Assets/Sites";
import Tasks from "../components/Work/Assets/Tasks";
import Content from "../components/Work/Assets/Content";
import WorkProject from "../components/Work/Assets/Projects";
import SiteDetails from "../components/Work/Assets/SiteDetails";
import AssetDetails from "../components/Work/Assets/AssetDetails";
import UsersList from "../components/OrgAdmin/UsersList";
import ControlPanel from "../components/AdminControls/ControlPanel";
import WorkflowBuilder from "../components/Work/WorkflowBuilder/WorkflowBuilder"
import Course from "../components/LMS/CourseBuilder/Course";
import Module from "../components/LMS/Module/Module";
import Skill from "../components/LMS/CourseBuilder/Skill";
import DocumentManager from "../components/Documents/DocumentManager";
import CourseDetails from "../components/LMS/CourseBuilder/CourseDetails";
import CourseLearn from "../components/LMS/Quiz/CourseLearn";
import AssignCourse from "../components/LMS/AssignCourse";
import MyCourses from "../components/LMS/CourseBuilder/MyCourses";
import MySkills from "../components/LMS/CourseBuilder/MySkills";
import SkillCreate from "../components/LMS/SkillCreate";
import AssignSkill from "../components/LMS/AssignSkill";
import SkillEvidenceUpload from "../components/LMS/SkillEvidenceUpload";
import SkillDetails from "../components/LMS/CourseBuilder/SkillDetails";
import OrgDetails from "../components/OrgAdmin/OrgDetails";
import UserDetails from "../components/OrgAdmin/UserDetails";
import ModuleDetails from "../components/LMS/Module/ModuleDetails";
import AssignModule from "../components/LMS/Module/AssignModule";
import MyModules from "../components/LMS/Module/MyModules";
import MyModuleDetails from "../components/LMS/Module/MyModuleDetails";
import LMSDashboard from "../components/LMS/LMSDashboard";
import WorkflowDashboard from "../components/Work/WorkflowDashboard";
import LearnDetails from "../components/LMS/LearnDetails";
import WorkflowDetails from "../components/Work/WorkflowDetails";
import HRDetails from "../components/HumanResources/HRDetails";
import SafetyDetails from "../components/Safety/SafetyDetails";
import FinanceDetails from "../components/Finance/FinanceDetails";



export const PageRegistry: Record<
  string,
  React.ComponentType<any>
> = {
  chat: Chat,
  settings: Settings,
  upload: FileUpload,
  placeholder: Placeholder,
  agents: Agents,
  knowledge: Knowledge,
  organisation: Organisation,
  projects: Projects,
  //learn: Learn,
  account: Account,
  //workflow_builder: WorkflowBuilderContainer,
  workflow: Workflow,
  workorders: WorkOrders,
  assets: Assets,
  sites: Sites,
  tasks: Tasks,
  content: Content,
  workproject: WorkProject,
  sitedetails : SiteDetails,
  assetdetails : AssetDetails,
  userslist : UsersList,
  controlpanel : ControlPanel,
  workflowbuilder : WorkflowBuilder,
  course : Course,
  module : Module,
  skill : Skill,
  documentmanager : DocumentManager,
  coursedetails : CourseDetails,
  courselearn : CourseLearn,
  assigncourse : AssignCourse,
  mycourses : MyCourses,
  myskills : MySkills,
  assignskill : AssignSkill,
  skillcreate : SkillCreate,
  skillevidence : SkillEvidenceUpload,
  skilldetails : SkillDetails,
  orgdetails : OrgDetails,
  userdetails : UserDetails,
  moduledetails : ModuleDetails,
  assignmodule : AssignModule,
  mymodules : MyModules,
  mymoduledetails : MyModuleDetails,
  learndashboard : LMSDashboard,
  workdashboard : WorkflowDashboard,
  learnhome : LearnDetails,
  workhome : WorkflowDetails,
  hrhome : HRDetails,
  financehome : FinanceDetails,
  safetyhome : SafetyDetails,

};
