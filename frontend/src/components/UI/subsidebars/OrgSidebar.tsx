// OrgSidebar.tsx


import { FiUsers, FiSettings, FiUserPlus } from "react-icons/fi";

const OrgSidebar = ({ setMainPage }: { setMainPage: (page: string) => void }) => {
  return (
    <>
      <h2 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
        <FiUsers className="text-base" /> Organisation
      </h2>
      <div className="flex flex-col gap-2 text-gray-700">
        <button
          onClick={() => setMainPage("userslist")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiUsers /> Users
        </button>
        <button
          onClick={() => setMainPage("orgdetails")}
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
        >
          <FiSettings /> Settings
        </button>
      </div>
      <hr className="my-4" />
      <div className="text-xs text-gray-500">Management</div>
      <button
        onClick={() => setMainPage("invite")}
        className="mt-2 text-blue-600 hover:underline text-sm flex items-center gap-1"
      >
        <FiUserPlus /> Invite User
      </button>
    </>
  );
};

export default OrgSidebar;
