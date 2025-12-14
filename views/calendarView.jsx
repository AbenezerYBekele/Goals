import React, { useMemo, useState } from 'react';
import { useGoals } from '../contexts/GoalContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export const CalendarView = () => {
  const { goals } = useGoals();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const goalsByDate = useMemo(() => {
    const map = {};
    goals.forEach(goal => {
      const d = new Date(goal.dueDate);
      if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(goal);
      }
    });
    return map;
  }, [goals, currentDate]);

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const statusColors = {
    'NOT_STARTED': 'bg-slate-200 text-slate-700',
    'IN_PROGRESS': 'bg-blue-100 text-blue-700',
    'COMPLETED': 'bg-green-100 text-green-700',
    'CANCELLED': 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-full">
            <ChevronLeftIcon className="w-6 h-6 text-slate-600" />
          </button>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-full">
            <ChevronRightIcon className="w-6 h-6 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="border-r border-b border-slate-100 bg-slate-50/30 p-2 min-h-[100px]" />
          ))}
          
          {days.map(day => {
            const daysGoals = goalsByDate[day] || [];
            const isToday = day === new Date().getDate() && 
                            currentDate.getMonth() === new Date().getMonth() && 
                            currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div key={day} className={`border-r border-b border-slate-100 p-2 min-h-[120px] transition-colors hover:bg-slate-50 flex flex-col gap-1 ${isToday ? 'bg-blue-50/50' : ''}`}>
                <div className="flex justify-between items-start">
                   <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                     {day}
                   </span>
                   {daysGoals.length > 0 && (
                     <span className="text-xs text-slate-400">{daysGoals.length} items</span>
                   )}
                </div>
                
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[100px] mt-1 pr-1 custom-scrollbar">
                  {daysGoals.map(goal => (
                    <div key={goal.id} className={`text-[10px] px-2 py-1 rounded border truncate ${statusColors[goal.status]} ${goal.horizon === 'daily' ? 'border-l-4' : ''}`}>
                       {goal.horizon === 'daily' ? '' : `[${goal.horizon[0].toUpperCase()}] `}
                       {goal.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};