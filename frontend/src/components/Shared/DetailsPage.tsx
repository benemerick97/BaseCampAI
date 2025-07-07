// frontend/src/components/Shared/DetailsPage.tsx

import React, { useState, type JSX } from "react";

interface TabConfig {
  key: string;
  label: string;
  icon: JSX.Element;
  content: React.ReactNode;
}

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface DetailsPageProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  tabs: TabConfig[];
}

export default function DetailsPage({
  title,
  breadcrumbs,
  tabs,
}: DetailsPageProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || "");

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div>
        <div className="text-sm text-gray-500 mb-2 flex gap-1 items-center">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1">
              {crumb.onClick ? (
                <span
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={crumb.onClick}
                >
                  {crumb.label}
                </span>
              ) : (
                <span className="text-gray-600">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </div>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all border ${
              activeTab === tab.key
                ? "bg-blue-50 text-blue-700 border-blue-500"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {tabs.map(
          (tab) =>
            tab.key === activeTab && (
              <div key={tab.key} className="animate-fade-in">
                {tab.content}
              </div>
            )
        )}
      </div>
    </div>
  );
}
