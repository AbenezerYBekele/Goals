import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoalStatus } from '../types';

const GoalContext = createContext(undefined);

const STORAGE_KEY = 'stratlife_goals_v1';

export const GoalProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [aiAdvice, setAiAdvice] = useState("Ready to plan your life?");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setGoals(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse goals", e);
      }
    } else {
      // Seed data if empty
      const seed = {
        id: 'seed-1',
        title: 'Launch my Dream Startup',
        description: 'Build and launch a SaaS product in the AI space.',
        horizon: 'annual',
        status: GoalStatus.IN_PROGRESS,
        progress: 25,
        dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        smartCriteria: {
          specific: 'Launch MVP of AI planner',
          measurable: '1000 active users',
          achievable: 'Using weekends and evenings',
          relevant: 'Financial independence goal',
          timeBound: 'By Dec 31st'
        },
        category: 'Career'
      };
      setGoals([seed]);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    }
  }, [goals]);

  const addGoal = (goal) => {
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const getGoalsByHorizon = (horizon) => {
    return goals.filter(g => g.horizon === horizon);
  };

  const getGoalsByParent = (parentId) => {
    return goals.filter(g => g.parentId === parentId);
  };

  const refreshAdvice = async () => {
    // This would ideally be called via the service, but for now we keep state here
    return ""; // Placeholder, the view calls the service directly mostly
  };

  return (
    <GoalContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal, getGoalsByHorizon, getGoalsByParent, refreshAdvice, aiAdvice }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (!context) throw new Error("useGoals must be used within GoalProvider");
  return context;
};