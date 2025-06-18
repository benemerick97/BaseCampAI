import React from "react";

interface MainProps {
  children: React.ReactNode;
}

const Main = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex-1 bg-white p-6 rounded-2xl overflow-y-auto ml-2 border border-gray-300">
      {children}
    </main>
  );
};

export default Main;
