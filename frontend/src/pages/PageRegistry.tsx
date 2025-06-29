// src/pages/PageRegistry.tsx

import Chat from "../components/Chat/Chat";
import Settings from "../components/Settings";
import FileUpload from "../components/Documents/FileUpload";
import Placeholder from "../components/Placeholder";
import Agents from "../components/Agents";
import Knowledge from "../components/Documents/Knowledge";
import Organisation from "../components/Organisation";
import Projects from "../components/Projects";
import Learn from "../components/LMS/Learn";
import Account from "../components/Account";
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
import UsersList from "../components/UsersList";
import ControlPanel from "../components/AdminControls/ControlPanel";
import WorkflowBuilder from "../components/Work/WorkflowBuilder/WorkflowBuilder"
import Course from "../components/LMS/CourseBuilder/Course";
import Module from "../components/LMS/CourseBuilder/Module";
import Skill from "../components/LMS/CourseBuilder/Skill";
import DocumentManager from "../components/Documents/DocumentManager";

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
  learn: Learn,
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
};
