import React, { useState } from 'react';
import { GoalStatus } from '../types';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, CheckCircleIcon, ArrowPathIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { GeminiService } from '../services/geminiService';
import { useGoals } from '../contexts/GoalContext';

export const GoalCard = ({ goal }) => {
  const { updateGoal, deleteGoal, addGoal } = useGoals();
  const [expanded, setExpanded] = useState(false);
  const [breakingDown, setBreakingDown] = useState(false);
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  const statusColors = {
    [GoalStatus.NOT_STARTED]: 'bg-slate-100 text-slate-600 border-slate-200',
    [GoalStatus.IN_PROGRESS]: 'bg-blue-50 text-blue-700 border-blue-200',
    [GoalStatus.COMPLETED]: 'bg-green-50 text-green-700 border-green-200',
    [GoalStatus.CANCELLED]: 'bg-red-50 text-red-700 border-red-200',
  };

  const handleStatusChange = () => {
    const nextStatus = goal.status === GoalStatus.NOT_STARTED ? GoalStatus.IN_PROGRESS 
      : goal.status === GoalStatus.IN_PROGRESS ? GoalStatus.COMPLETED 
      : GoalStatus.NOT_STARTED;
    
    updateGoal({ 
      ...goal, 
      status: nextStatus,
      progress: nextStatus === GoalStatus.COMPLETED ? 100 : goal.progress
    });
  };

  const handleAiBreakdown = async () => {
    if (breakingDown) return;
    setBreakingDown(true);
    try {
      const subGoals = await GeminiService.breakdownGoal(goal);
      subGoals.forEach(sg => {
        addGoal({
          ...sg,
          id: crypto.randomUUID(),
          parentId: goal.id,
          // Calculate rudimentary dates
          dueDate: new Date(Date.now() + (sg.dueDateOffset || 7) * 86400000).toISOString()
        });
      });
      alert(`Created ${subGoals.length} sub-goals! Check the next planner level.`);
    } catch (e) {
      console.error(e);
      alert('Failed to breakdown goal.');
    } finally {
      setBreakingDown(false);
    }
  };

  const handleAddReview = () => {
    if (!reviewNote.trim()) return;
    const newReview = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      note: reviewNote
    };
    updateGoal({
      ...goal,
      reviews: [...(goal.reviews || []), newReview]
    });
    setReviewNote('');
    setShowReviewInput(false);
    setExpanded(true); // Show the reviews section
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 bg-white shadow-sm hover:shadow-md ${statusColors[goal.status].replace('bg-', 'border-l-4 border-l-')}`}>
      <div className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusColors[goal.status]}`}>
                {goal.category}
              </span>
              <span className="text-xs text-slate-400">{new Date(goal.dueDate).toLocaleDateString()}</span>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 leading-tight">{goal.title}</h4>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{goal.description}</p>
          </div>
          
          <button 
            onClick={handleStatusChange}
            className={`flex-shrink-0 p-2 rounded-full transition-colors ${goal.status === GoalStatus.COMPLETED ? 'text-green-600 bg-green-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'}`}
          >
            <CheckCircleIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${goal.status === GoalStatus.COMPLETED ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-4">
           <button 
             onClick={() => setExpanded(!expanded)}
             className="text-xs font-medium text-slate-500 flex items-center gap-1 hover:text-indigo-600"
           >
             {expanded ? 'Hide Details' : 'Show Details & Reviews'}
             {expanded ? <ChevronUpIcon className="w-3 h-3"/> : <ChevronDownIcon className="w-3 h-3"/>}
           </button>

           <div className="flex gap-2">
             <button
                onClick={() => setShowReviewInput(!showReviewInput)}
                className="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-100 font-medium flex items-center gap-1"
             >
               <PencilSquareIcon className="w-3 h-3" />
               Review
             </button>

             {goal.horizon !== 'daily' && (
               <button 
                 onClick={handleAiBreakdown}
                 disabled={breakingDown}
                 className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100 font-medium flex items-center gap-1"
               >
                 {breakingDown ? <ArrowPathIcon className="w-3 h-3 animate-spin"/> : <ArrowPathIcon className="w-3 h-3"/>}
                 Break Down
               </button>
             )}
             <button 
               onClick={() => deleteGoal(goal.id)}
               className="text-slate-400 hover:text-red-500 p-1"
             >
               <TrashIcon className="w-4 h-4" />
             </button>
           </div>
        </div>

        {showReviewInput && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
             <textarea 
               value={reviewNote}
               onChange={(e) => setReviewNote(e.target.value)}
               className="w-full text-sm p-2 border rounded mb-2 h-20 outline-none focus:ring-1 ring-indigo-500"
               placeholder="What progress did you make? What blocked you?"
             />
             <div className="flex justify-end gap-2">
               <button onClick={() => setShowReviewInput(false)} className="text-xs text-slate-500 hover:text-slate-800">Cancel</button>
               <button onClick={handleAddReview} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Save Review</button>
             </div>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/50 rounded-b-xl mt-2">
           {goal.smartCriteria && (
             <div className="grid grid-cols-1 gap-2 pt-3 text-sm mb-4">
                <div className="flex gap-2"><span className="font-bold w-4 text-indigo-600">S</span> <span className="text-slate-600">{goal.smartCriteria.specific}</span></div>
                <div className="flex gap-2"><span className="font-bold w-4 text-indigo-600">M</span> <span className="text-slate-600">{goal.smartCriteria.measurable}</span></div>
                <div className="flex gap-2"><span className="font-bold w-4 text-indigo-600">A</span> <span className="text-slate-600">{goal.smartCriteria.achievable}</span></div>
                <div className="flex gap-2"><span className="font-bold w-4 text-indigo-600">R</span> <span className="text-slate-600">{goal.smartCriteria.relevant}</span></div>
                <div className="flex gap-2"><span className="font-bold w-4 text-indigo-600">T</span> <span className="text-slate-600">{goal.smartCriteria.timeBound}</span></div>
             </div>
           )}

           {goal.reviews && goal.reviews.length > 0 && (
             <div className="pt-2 border-t border-slate-200">
               <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Progress Logs</h5>
               <div className="space-y-2">
                 {goal.reviews.map(review => (
                   <div key={review.id} className="bg-white p-2 rounded border border-slate-100 text-sm">
                     <div className="text-xs text-slate-400 mb-1">{new Date(review.date).toLocaleString()}</div>
                     <div className="text-slate-700">{review.note}</div>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};