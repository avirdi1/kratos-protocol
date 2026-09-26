import { useState, useEffect, useCallback } from 'react';
import type { WorkoutLog } from '../data/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useWorkoutLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  const fetchLogs = useCallback(async () => {
    if (!user) { setLogs([]); return; }

    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!error && data) {
      setLogs(data.map(row => ({
        id: row.id,
        date: row.date,
        type: row.type,
        planId: row.plan_id ?? undefined,
        planName: row.plan_name ?? undefined,
        exercises: row.exercises,
        notes: row.notes ?? undefined,
      })));
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = useCallback(async (log: WorkoutLog) => {
    if (!user) return;
    setLogs(prev => [log, ...prev]);
    const { error } = await supabase.from('workout_logs').insert({
      id: log.id,
      user_id: user.id,
      date: log.date,
      type: log.type,
      plan_id: log.planId ?? null,
      plan_name: log.planName ?? null,
      exercises: log.exercises,
      notes: log.notes ?? null,
    });
    if (error) {
      alert(`Failed to save workout: ${error.message}`);
      fetchLogs();
    }
  }, [user, fetchLogs]);

  const deleteLog = useCallback(async (id: string) => {
    if (!user) return;
    setLogs(prev => prev.filter(l => l.id !== id));
    const { error } = await supabase.from('workout_logs').delete().eq('id', id);
    if (error) { console.error(error); fetchLogs(); }
  }, [user, fetchLogs]);

  const updateLog = useCallback(async (updated: WorkoutLog) => {
    if (!user) return;
    setLogs(prev => prev.map(l => l.id === updated.id ? updated : l));
    const { error } = await supabase.from('workout_logs').update({
      date: updated.date,
      type: updated.type,
      plan_id: updated.planId ?? null,
      plan_name: updated.planName ?? null,
      exercises: updated.exercises,
      notes: updated.notes ?? null,
    }).eq('id', updated.id);
    if (error) { console.error(error); fetchLogs(); }
  }, [user, fetchLogs]);

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getLogsForDate = useCallback(
    (date: string) => logs.filter(l => l.date === date),
    [logs]
  );

  const loggedDates = new Set(logs.map(l => l.date));

  function getThisWeekLogs(): WorkoutLog[] {
    const now = new Date();
    const day = now.getDay();
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
      if (diff === 1) { streak++; } else { break; }
    }
    return streak;
  }

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
