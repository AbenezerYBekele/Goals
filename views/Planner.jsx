import React, { useState } from 'react';
import { useGoals } from '../contexts/GoalContext';
import { GoalCard } from '../components/GoalCard';
import { SmartWizard } from '../components/SmartWizard';
import { PlusIcon } from '@heroicons/react/24/solid';
import { GeminiService } from '../services/geminiService';
import { LightBulbIcon } from '@heroicons/react/24/outline';

export const Planner = ({ horizon }) => {
  const { getGoalsByHorizon, aiAdvice } = useGoals();
  const [isWizardOpen, setWizardOpen] = useState(false);
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const goals = getGoalsByHorizon(horizon);
  const { addGoal } = useGoals();

  const handleSaveGoals = (newGoals) => {
    newGoals.forEach(g => addGoal(g));
  };

  const getStrategicAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const adv = await GeminiService.getAdvice(goals);
      setAdvice(adv);
    } catch (e) {
      setAdvice("Could not fetch advice at this moment.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  const titles = {
    annual: "Annual Vision Board",
    monthly: "Monthly Roadmap",
    weekly: "Weekly Sprints",
    daily: "Daily Action Plan"
  };

  const descriptions = {
    annual: "Define your big picture. What does success look like in 12 months?",
    monthly: "Break down the big picture into 12 distinct milestones.",
    weekly: "What are the key deliverables for this week?",
    daily: "Execute. One task at a time."
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{titles[horizon]}</h2>
          <p className="text-slate-500 mt-2">{descriptions[horizon]}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={getStrategicAdvice}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg font-medium hover:bg-yellow-100 border border-yellow-200"
          >
            <LightBulbIcon className="w-5 h-5" />
            {loadingAdvice ? "Thinking..." : "Get AI Advice"}
          </button>
          <button 
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-transform active:scale-95"
          >
            <PlusIcon className="w-5 h-5" />
            Add {horizon} Goal
          </button>
        </div>
      </div>

      {advice && (
        <div className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl flex items-start gap-4">
           <div className="p-2 bg-white rounded-full shadow-sm">
             <LightBulbIcon className="w-6 h-6 text-indigo-500" />
           </div>
           <div>
             <h4 className="font-bold text-indigo-900 text-sm uppercase mb-1">AI Coach Says</h4>
             <p className="text-indigo-800 leading-relaxed italic">"{advice}"</p>
           </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="text-center p-8 max-w-md">
            <h3 className="text-lg font-bold text-slate-700">No goals found for this horizon</h3>
            <p className="text-slate-500 mt-2 mb-6">Start by creating a strategic goal. Use the AI Wizard to ensure it's SMART.</p>
            <button 
              onClick={() => setWizardOpen(true)}
              className="text-blue-600 font-medium hover:underline"
            >
              Create your first goal &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <SmartWizard 
        isOpen={isWizardOpen} 
        onClose={() => setWizardOpen(false)} 
        onSave={handleSaveGoals}
        initialHorizon={horizon}
      />
    </div>
  );
};