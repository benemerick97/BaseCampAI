// frontend/src/components/UI/subsidebars/LearnSidebar.tsx

import { FiBookOpen, FiBook, FiLayers, FiUser, FiUsers } from "react-icons/fi";
import { LuBrain } from "react-icons/lu";

const LearnSidebar = ({ setMainPage }: { setMainPage: (page: string) => void }) => {
  return (
    <>
      <h2 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
        <FiBookOpen className="text-base" /> Learn
      </h2>
      <div className="flex flex-col gap-2 text-gray-700">
        <button 
          onClick={() => setMainPage("mycourses")}          
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded">
          <FiBook /> My Courses
        </button>
         <button
          onClick={() => setMainPage("myskills")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <LuBrain /> My Skills
        </button>
        <button 
          onClick={() => setMainPage("mymodules")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded">
          <FiLayers /> My Modules
        </button>                               
        <button 
          onClick={() => setMainPage("course")}  
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded">
          <FiBook /> Courses
        </button>        
         <button
          onClick={() => setMainPage("skill")}   
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <LuBrain /> Skills
        </button>       
        <button 
          onClick={() => setMainPage("module")}   
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded">
          <FiLayers /> Modules
        </button>
        <button 
          onClick={() => setMainPage("userslist")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded">
          <FiUser /> Users
        </button>
        <button 

          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded">
          <FiUsers /> Groups
        </button>                           
      </div>
      <hr className="my-4" />
      <div className="text-xs text-gray-500">Suggestions</div>
      <button 
        onClick={() => setMainPage("learn")}
        className="mt-2 text-blue-600 hover:underline text-sm">
        Add a Course
      </button>
      <button 
        onClick={() => setMainPage("assigncourse")}
        className="mt-2 text-blue-600 hover:underline text-sm">
        Assign a Course
      </button>
      <button 
        onClick={() => setMainPage("assignskill")}
        className="mt-2 text-blue-600 hover:underline text-sm">
        Assign a Skill
      </button>
      <button 
        onClick={() => setMainPage("assignmodule")}
        className="mt-2 text-blue-600 hover:underline text-sm">
        Assign a Module
      </button>              
    </>
  );
};

export default LearnSidebar;
