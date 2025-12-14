import React from 'react';
import { ChartBarIcon, CalendarIcon, ListBulletIcon, Cog6ToothIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

export const Sidebar = ({ currentView, setView }) => {
  const menu = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon },
    { id: 'annual', label: 'Annual Vision', icon: CalendarIcon },
    { id: 'monthly', label: 'Monthly Plan', icon: CalendarIcon },
    { id: 'weekly', label: 'Weekly Plan', icon: CalendarIcon },
    { id: 'daily', label: 'Daily Focus', icon: ListBulletIcon },
  ];

  return (
    <div className="w-64 bg-slate-850 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-10 hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          GOALs
        </h1>
        <p className="text-slate-400 text-xs mt-1">Design Your Future</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentView === item.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 text-slate-400 hover:text-white text-sm px-4 py-2 w-full">
           <Cog6ToothIcon className="w-5 h-5" />
           Settings
        </button>
      </div>
    </div>
  );
};