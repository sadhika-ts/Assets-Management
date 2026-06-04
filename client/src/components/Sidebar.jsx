import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/assets', label: 'Assets', icon: '💻' },
    { path: '/purchases', label: 'Purchases', icon: '🛒' },
    { path: '/contracts', label: 'Contracts', icon: '📋' },
    { path: '/reports', label: 'Reports', icon: '📈' }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold text-gray-800">Asset Manager</h1>
            <p className="text-xs text-gray-500 mt-1">IT Inventory System</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="md:hidden text-gray-600 hover:text-gray-800 p-1"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-2 transition-colors ${
              isActive(item.path)
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={collapsed ? item.label : ''}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        {!collapsed && (
          <p className="text-xs text-gray-600 text-center">No authentication required</p>
        )}
      </div>
    </div>
  );
};
