import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const Topbar = ({ title, onMenuClick }) => {
  const { dark, toggle } = useTheme();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-700/50 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-sm transition-colors">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-800 dark:text-slate-100 leading-tight">{title}</h1>
          <p className="hidden sm:block text-[11px] text-gray-400 dark:text-slate-500 leading-tight">{dateStr}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={dark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-inner ${dark ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-300 bg-white ${dark ? 'translate-x-7' : 'translate-x-0'}`}>
            {dark
              ? <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              : <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                </svg>
            }
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 hidden sm:block" />

        {/* User */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 leading-tight">Admin</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 leading-tight">IT Department</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/25 ring-2 ring-white dark:ring-slate-800">
            A
          </div>
        </div>
      </div>
    </header>
  );
};
