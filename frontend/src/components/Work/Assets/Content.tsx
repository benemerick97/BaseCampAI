import React from "react";
import { FiPlus, FiEdit3, FiUpload } from "react-icons/fi";

interface ContentItem {
  title: string;
  type: string;
  updatedDate: string;
}

interface ContentProps {
  setMainPage: (page: string) => void;
}

const contents: ContentItem[] = [
];

export default function Content({ setMainPage }: ContentProps) {
  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-semibold leading-tight">Content</h3>
          <span className="text-sm text-gray-600">(1 - {contents.length} of {contents.length})</span>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 border border-blue-600 text-blue-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-50">
            <FiEdit3 size={16} />
            Describe
          </button>
          <button className="flex items-center gap-1 border border-blue-600 text-blue-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-50">
            <FiUpload size={16} />
            Upload
          </button>
          <button 
            onClick={() => setMainPage("content_creator")}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700">
            <FiPlus size={16} />
            Add Content
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search all content"
          className="border px-3 py-2 rounded w-full max-w-sm text-sm"
        />
        <button className="text-sm text-blue-600 font-medium">+ Add filter</button>
      </div>

      {contents.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border rounded bg-gray-50">
          <p className="text-lg font-medium">No content available</p>
          <p className="text-sm mt-1">Click "Add Content" to upload or create your first item.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 rounded-lg bg-white">
            <thead className="bg-gray-100 text-left text-gray-600 font-medium border-b border-gray-300">
              <tr>
                <th className="px-4 py-2 border-r border-gray-200">Title</th>
                <th className="px-4 py-2 border-r border-gray-200">Type</th>
                <th className="px-4 py-2 border-r border-gray-200 whitespace-nowrap">Last Updated</th>
                <th className="px-4 py-2 border-r border-gray-200">Visibility</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {contents.map((content, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-100 font-semibold text-gray-900">{content.title}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-700">{content.type}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-600">{content.updatedDate}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-gray-600">Public</td>
                  <td className="px-4 py-3 text-right">
                    <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
