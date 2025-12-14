import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { GoalStatus, CATEGORIES } from '../types';
import { GeminiService } from '../services/geminiService';
import { ArrowPathIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

export const SmartWizard = ({ isOpen, onClose, onSave, initialHorizon = 'annual', parentId = undefined }) => {
  const [step, setStep] = useState('input');
  const [rawInput, setRawInput] = useState('');
  const [horizon, setHorizon] = useState(initialHorizon);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [fullPlan, setFullPlan] = useState(null);
  const [simpleGoal, setSimpleGoal] = useState(null);
  const [isFullPlanMode, setIsFullPlanMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!rawInput.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      if (isFullPlanMode && horizon === 'annual') {
        // Generate Hierarchy
        const plan = await GeminiService.generateStrategicPlan(rawInput, category);
        setFullPlan(plan);
        setSimpleGoal(null);
      } else {
        // Simple Single Goal
        const result = await GeminiService.refineToSmart(rawInput, horizon);
        setSimpleGoal({
          title: result.title,
          description: result.description,
          smartCriteria: result.smart,
          horizon: horizon,
          parentId: parentId,
          category: category,
          status: GoalStatus.NOT_STARTED,
          progress: 0,
          dueDate: new Date().toISOString().split('T')[0]
        });
        setFullPlan(null);
      }
      setStep('review');
    } catch (err: any) {
      setError(err.message || "Failed to generate plan. Check API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSave = () => {
    const goalsToSave = [];

    if (fullPlan) {
      // Create Annual Goal
      const annualId = crypto.randomUUID();
      goalsToSave.push({
        id: annualId,
        title: fullPlan.annual.title,
        description: fullPlan.annual.description,
        smartCriteria: fullPlan.annual.smart,
        horizon: 'annual',
        status: GoalStatus.NOT_STARTED,
        progress: 0,
        category: category,
        dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      });

      // Monthly
      const firstMonthId = crypto.randomUUID();
      fullPlan.monthly.forEach((m, idx) => {
        const id = idx === 0 ? firstMonthId : crypto.randomUUID();
        goalsToSave.push({
          id,
          parentId: annualId,
          title: m.title,
          description: m.description,
          horizon: 'monthly',
          status: GoalStatus.NOT_STARTED,
          progress: 0,
          category,
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + idx + 1)).toISOString(),
          smartCriteria: { specific: m.description, measurable: 'TBD', achievable: 'Yes', relevant: 'Yes', timeBound: '1 Month' }
        });
      });

      // Weekly
      const firstWeekId = crypto.randomUUID();
      fullPlan.weekly.forEach((w, idx) => {
         const id = idx === 0 ? firstWeekId : crypto.randomUUID();
         goalsToSave.push({
          id,
          parentId: firstMonthId,
          title: w.title,
          description: w.description,
          horizon: 'weekly',
          status: GoalStatus.NOT_STARTED,
          progress: 0,
          category,
          dueDate: new Date(new Date().setDate(new Date().getDate() + (idx + 1) * 7)).toISOString(),
          smartCriteria: { specific: w.description, measurable: 'TBD', achievable: 'Yes', relevant: 'Yes', timeBound: '1 Week' }
         });
      });

      // Daily
      fullPlan.daily.forEach((d, idx) => {
        goalsToSave.push({
          id: crypto.randomUUID(),
          parentId: firstWeekId,
          title: d.title,
          description: d.description,
          horizon: 'daily',
          status: GoalStatus.NOT_STARTED,
          progress: 0,
          category,
          dueDate: new Date(new Date().setDate(new Date().getDate() + idx + 1)).toISOString(),
          smartCriteria: { specific: d.description, measurable: 'TBD', achievable: 'Yes', relevant: 'Yes', timeBound: '1 Day' }
        });
      });

    } else if (simpleGoal) {
      goalsToSave.push({
        ...simpleGoal,
        id: crypto.randomUUID(),
        dueDate: simpleGoal.dueDate || new Date().toISOString()
      });
    }

    onSave(goalsToSave);
    onClose();
    // Reset
    setStep('input');
    setRawInput('');
    setFullPlan(null);
    setSimpleGoal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-indigo-600" />
            New Strategic Goal
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 'input' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time Horizon</label>
                    <select 
                      value={horizon} 
                      onChange={(e) => setHorizon(e.target.value)}
                      className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="annual">Annual Vision (1 Year)</option>
                      <option value="monthly">Monthly Milestone</option>
                      <option value="weekly">Weekly Target</option>
                      <option value="daily">Daily Action</option>
                    </select>
                 </div>
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border-slate-300 border p-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>

              {horizon === 'annual' && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <input 
                    type="checkbox" 
                    id="fullPlan"
                    checked={isFullPlanMode}
                    onChange={(e) => setIsFullPlanMode(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="fullPlan" className="text-sm text-indigo-900 font-medium cursor-pointer">
                    Auto-generate full Strategic Roadmap?
                    <span className="block text-xs text-indigo-700 font-normal">Creates Annual goal plus breakdown of Monthly, Weekly, and Daily tasks instantly.</span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">What do you want to achieve?</label>
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="e.g., I want to lose 10kg and run a marathon by December..."
                  className="w-full h-32 rounded-lg border-slate-300 border p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">Just type your rough idea. Our AI will structure it for you.</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'review' && (
             <div className="space-y-6">
               {fullPlan ? (
                 <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <h4 className="text-lg font-bold text-indigo-900">Annual: {fullPlan.annual.title}</h4>
                      <p className="text-sm text-indigo-700">{fullPlan.annual.description}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-700 mb-2">Detailed Breakdown Preview:</h5>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p><span className="font-semibold text-blue-600">Monthly Milestones:</span> {fullPlan.monthly.length} items (e.g., {fullPlan.monthly[0].title})</p>
                        <p><span className="font-semibold text-blue-600">Weekly Tasks:</span> {fullPlan.weekly.length} items (e.g., {fullPlan.weekly[0].title})</p>
                        <p><span className="font-semibold text-blue-600">Daily Actions:</span> {fullPlan.daily.length} items (e.g., {fullPlan.daily[0].title})</p>
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded text-green-800 text-sm">
                       <CheckIcon className="w-4 h-4 inline mr-2"/>
                       Ready to populate your calendar and dashboard.
                    </div>
                 </div>
               ) : simpleGoal ? (
                 <div className="space-y-6">
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <h4 className="text-xl font-bold text-indigo-900">{simpleGoal.title}</h4>
                      <p className="text-indigo-700 mt-1">{simpleGoal.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(simpleGoal.smartCriteria || {}).map(([key, value]) => (
                        <div key={key} className="bg-slate-50 p-3 rounded border border-slate-100">
                          <span className="text-xs font-bold uppercase text-slate-400 block mb-1">{key}</span>
                          {/* @ts-ignore */}
                          <p className="text-sm text-slate-800">{value}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                      <input 
                        type="date" 
                        value={simpleGoal.dueDate}
                        onChange={(e) => setSimpleGoal({...simpleGoal, dueDate: e.target.value})}
                        className="rounded-lg border-slate-300 border p-2"
                      />
                    </div>
                 </div>
               ) : null}
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
          {step === 'input' ? (
             <button
              onClick={handleGenerate}
              disabled={loading || !rawInput}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-medium"
             >
               {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
               {isFullPlanMode ? 'Generate Full Plan' : 'Smartify Goal'}
             </button>
          ) : (
            <>
              <button
                onClick={() => setStep('input')}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Back
              </button>
              <button
                onClick={handleFinalSave}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Confirm & Save
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};