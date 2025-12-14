import React, { useMemo } from 'react';
import { useGoals } from '../contexts/GoalContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { GoalStatus } from '../types';

export const Dashboard = () => {
  const { goals } = useGoals();

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
    const inProgress = goals.filter(g => g.status === GoalStatus.IN_PROGRESS).length;
    
    return { total, completed, inProgress, completionRate: total ? Math.round((completed / total) * 100) : 0 };
  }, [goals]);

  const data = [
    { name: 'Completed', value: stats.completed, color: '#22c55e' },
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Not Started', value: stats.total - stats.completed - stats.inProgress, color: '#cbd5e1' },
  ];

  const categoryData = useMemo(() => {
    const counts = {};
    goals.forEach(g => {
       counts[g.category || 'Other'] = (counts[g.category || 'Other'] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [goals]);

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Executive Dashboard</h2>
        <p className="text-slate-500">Your life strategy at a glance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium uppercase">Total Goals</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium uppercase">Completion Rate</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats.completionRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium uppercase">Active Now</p>
          <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <p className="text-sm text-slate-500 font-medium uppercase">Completed</p>
           <p className="text-4xl font-bold text-green-600 mt-2">{stats.completed}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Focus Areas</h3>
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={categoryData}>
               <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
               <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
             </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};