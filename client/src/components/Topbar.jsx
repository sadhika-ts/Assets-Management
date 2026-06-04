import React from 'react';

export const Topbar = ({ title }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">Welcome</p>
          <p className="text-xs text-gray-500">Asset Inventory System</p>
        </div>
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          A
        </div>
      </div>
    </div>
  );
};
