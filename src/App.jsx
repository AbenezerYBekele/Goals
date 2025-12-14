import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { Planner } from './views/Planner';
import { CalendarView } from './views/CalendarView';
import { GoalProvider } from './contexts/GoalContext';
import { Bars3Icon } from '@heroicons/react/24/outline';

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'calendar': return <CalendarView />;
      case 'annual': return <Planner horizon="annual" />;
      case 'monthly': return <Planner horizon="monthly" />;
      case 'weekly': return <Planner horizon="weekly" />;
      case 'daily': return <Planner horizon="daily" />;
      default: return <Dashboard />;
    }
  };

  return (
    <GoalProvider>
      <div className="min-h-screen bg-slate-50 flex font-sans">
        {/* Mobile Header */}
        <div className="md:hidden fixed w-full bg-slate-900 text-white z-20 flex justify-between items-center p-4">
           <span className="font-bold text-lg">GOALs</span>
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             <Bars3Icon className="w-6 h-6" />
           </button>
        </div>

        {/* Sidebar */}
        <div className={`md:block ${mobileMenuOpen ? 'block fixed inset-0 z-30 bg-slate-900' : 'hidden'}`}>
           <Sidebar currentView={currentView} setView={(v) => {
             setCurrentView(v);
             setMobileMenuOpen(false);
           }} />
        </div>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen overflow-y-auto bg-[#f8fafc]">
          {renderView()}
        </main>
      </div>
    </GoalProvider>
  );
};

export default App;