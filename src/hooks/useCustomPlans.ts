import { useState, useEffect, useCallback } from 'react';
import type { WorkoutPlan } from '../data/types';

const STORAGE_KEY = 'kratos_custom_plans';

function loadPlans(): WorkoutPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WorkoutPlan[]) : [];
  } catch {
    return [];
  }
}

export function useCustomPlans() {
  const [plans, setPlans] = useState<WorkoutPlan[]>(loadPlans);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  const addPlan = useCallback((plan: WorkoutPlan) => {
    setPlans(prev => [plan, ...prev]);
  }, []);

  const deletePlan = useCallback((id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  }, []);

  return { plans, addPlan, deletePlan };
}
