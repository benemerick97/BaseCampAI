import React from "react";

interface MainProps {
  children: React.ReactNode;
}

const Main = ({ children }: MainProps) => {
  return (
    <main className="flex-1 bg-white p-6 rounded-2xl ml-2 border border-gray-300">
      {children}
    </main>
  );
};

export default Main;
