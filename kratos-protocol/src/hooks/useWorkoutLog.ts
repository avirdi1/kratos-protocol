import { useState, useEffect, useCallback } from 'react';
import type { WorkoutLog } from '../data/types';

const STORAGE_KEY = 'kratos_workout_logs';

function loadLogs(): WorkoutLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WorkoutLog[]) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: WorkoutLog[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function useWorkoutLog() {
  const [logs, setLogs] = useState<WorkoutLog[]>(loadLogs);

  // Keep localStorage in sync whenever logs change
  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  const addLog = useCallback((log: WorkoutLog) => {
    setLogs(prev => [log, ...prev]);
  }, []);

  const deleteLog = useCallback((id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateLog = useCallback((updated: WorkoutLog) => {
    setLogs(prev => prev.map(l => l.id === updated.id ? updated : l));
  }, []);

  /** Logs sorted newest-first (already the case from addLog) */
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  /** All logs for a specific ISO date string (YYYY-MM-DD) */
  const getLogsForDate = useCallback(
    (date: string) => logs.filter(l => l.date === date),
    [logs]
  );

  /** Dates (YYYY-MM-DD) that have at least one logged session */
  const loggedDates = new Set(logs.map(l => l.date));

  /** Workouts logged in the current calendar week (Mon–Sun) */
  function getThisWeekLogs(): WorkoutLog[] {
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const mon = new Date(now);
    mon.setDate(now.getDate() + diffToMon);
    mon.setHours(0, 0, 0, 0);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    sun.setHours(23, 59, 59, 999);
    return logs.filter(l => {
      const d = new Date(l.date);
      return d >= mon && d <= sun;
    });
  }

  /** Current training streak in days */
  function getStreak(): number {
    if (logs.length === 0) return 0;
    const dates = [...new Set(logs.map(l => l.date))].sort().reverse();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  /** Total volume (lbs) lifted across all logs */
  function getTotalVolume(): number {
    return logs.reduce((total, log) => {
      return total + log.exercises.reduce((exTotal, ex) => {
        return exTotal + ex.sets.reduce((setTotal, s) => {
          const weight = s.unit === 'kg' ? s.weight * 2.205 : s.weight;
          return setTotal + weight * s.reps;
        }, 0);
      }, 0);
    }, 0);
  }

  return {
    logs: sortedLogs,
    addLog,
    deleteLog,
    updateLog,
    getLogsForDate,
    loggedDates,
    getThisWeekLogs,
    getStreak,
    getTotalVolume,
  };
}
