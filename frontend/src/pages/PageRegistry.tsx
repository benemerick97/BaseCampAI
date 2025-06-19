// src/pages/PageRegistry.tsx

import Chat from "../components/Chat";
import Settings from "../components/Settings";
import FileUpload from "../components/FileUpload";
import Placeholder from "../components/Placeholder";
import Agents from "../components/Agents";
import Knowledge from "../components/Knowledge";
import Organisation from "../components/Organisation";
import Projects from "../components/Projects";
import Learn from "../components/LMS/Learn";
import Account from "../components/Account";
import WorkflowBuilder from "../components/Work/WorkflowBuilder";
import Workflow from "../components/Work/Workflow";
import WorkOrders from "../components/Work/WorkOrders";
import Assets from "../components/Work/Assets";
import Sites from "../components/Work/Sites";
import Tasks from "../components/Work/Tasks";
import Content from "../components/Work/Content";
import WorkProject from "../components/Work/Projects";
import SiteDetails from "../components/Work/SiteDetails";

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
  workflow_builder: WorkflowBuilder,
  workflow: Workflow,
  workorders: WorkOrders,
  assets: Assets,
  sites: Sites,
  tasks: Tasks,
  content: Content,
  workproject: WorkProject,
  sitedetails : SiteDetails
};
