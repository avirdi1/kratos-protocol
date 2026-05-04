import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { DayType, LoggedExercise } from '../data/types';

export interface Challenge {
  id: string;
  createdBy: string;
  title: string;
  workoutType: DayType;
  exerciseIds: string[];
  exerciseNames: string[];
  status: 'active' | 'complete';
  inviteCode: string;
  createdAt: string;
}

export interface ChallengeParticipant {
  challengeId: string;
  userId: string;
  displayName: string;
  status: 'joined' | 'submitted';
}

export interface ChallengeSubmission {
  challengeId: string;
  userId: string;
  displayName: string;
  exercises: LoggedExercise[];
  score: number;
  submittedAt: string;
}

export interface ChallengeWithDetails extends Challenge {
  participants: ChallengeParticipant[];
  mySubmission: ChallengeSubmission | null;
  submissions: ChallengeSubmission[];
}

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function exerciseVolume(ex: LoggedExercise): number {
  return ex.sets.reduce((sum, s) => {
    const w = s.unit === 'kg' ? s.weight * 2.205 : s.weight;
    return sum + w * s.reps;
  }, 0);
}

async function computeScore(userId: string, exercises: LoggedExercise[]): Promise<number> {
  const { data } = await supabase
    .from('workout_logs')
    .select('exercises')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(60);

  const logs = data ?? [];
  const ratios: number[] = [];

  for (const ex of exercises) {
    const todayVol = exerciseVolume(ex);
    if (todayVol === 0) continue;

    const history = logs
      .filter(row =>
        (row.exercises as LoggedExercise[]).some(e => e.exerciseId === ex.exerciseId)
      )
      .slice(0, 5);

    if (history.length === 0) continue;

    const baseline =
      history.reduce((sum, row) => {
        const found = (row.exercises as LoggedExercise[]).find(
          e => e.exerciseId === ex.exerciseId
        );
        return sum + (found ? exerciseVolume(found) : 0);
      }, 0) / history.length;

    if (baseline > 0) ratios.push(todayVol / baseline);
  }

  return ratios.length > 0
    ? ratios.reduce((a, b) => a + b, 0) / ratios.length
    : 1.0;
}

export function useChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChallenges = useCallback(async () => {
    if (!user) { setChallenges([]); return; }
    setLoading(true);

    const { data: pRows } = await supabase
      .from('challenge_participants')
      .select('challenge_id')
      .eq('user_id', user.id);

    if (!pRows || pRows.length === 0) { setChallenges([]); setLoading(false); return; }

    const ids = pRows.map(r => r.challenge_id as string);

    const [{ data: cRows }, { data: allP }, { data: allS }] = await Promise.all([
      supabase.from('challenges').select('*').in('id', ids).order('created_at', { ascending: false }),
      supabase.from('challenge_participants').select('*').in('challenge_id', ids),
      supabase.from('challenge_submissions').select('*').in('challenge_id', ids),
    ]);

    const result: ChallengeWithDetails[] = (cRows ?? []).map(row => {
      const participants: ChallengeParticipant[] = (allP ?? [])
        .filter(p => p.challenge_id === row.id)
        .map(p => ({
          challengeId: p.challenge_id as string,
          userId: p.user_id as string,
          displayName: p.display_name as string,
          status: p.status as 'joined' | 'submitted',
        }));

      const submissions: ChallengeSubmission[] = (allS ?? [])
        .filter(s => s.challenge_id === row.id)
        .map(s => ({
          challengeId: s.challenge_id as string,
          userId: s.user_id as string,
          displayName: s.display_name as string,
          exercises: s.exercises as LoggedExercise[],
          score: Number(s.score),
          submittedAt: s.submitted_at as string,
        }));

      return {
        id: row.id as string,
        createdBy: row.created_by as string,
        title: row.title as string,
        workoutType: row.workout_type as DayType,
        exerciseIds: row.exercise_ids as string[],
        exerciseNames: row.exercise_names as string[],
        status: row.status as 'active' | 'complete',
        inviteCode: row.invite_code as string,
        createdAt: row.created_at as string,
        participants,
        submissions,
        mySubmission: submissions.find(s => s.userId === user.id) ?? null,
      };
    });

    setChallenges(result);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const createChallenge = useCallback(async (
    title: string,
    workoutType: DayType,
    exerciseIds: string[],
    exerciseNames: string[],
  ): Promise<string | null> => {
    if (!user) return null;
    const inviteCode = generateInviteCode();

    const { data, error } = await supabase
      .from('challenges')
      .insert({
        created_by: user.id,
        title,
        workout_type: workoutType,
        exercise_ids: exerciseIds,
        exercise_names: exerciseNames,
        status: 'active',
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (error || !data) return null;

    await supabase.from('challenge_participants').insert({
      challenge_id: data.id,
      user_id: user.id,
      display_name: user.email ?? 'You',
      status: 'joined',
    });

    await fetchChallenges();
    return inviteCode;
  }, [user, fetchChallenges]);

  const joinChallenge = useCallback(async (
    code: string,
  ): Promise<'joined' | 'already_in' | 'not_found'> => {
    if (!user) return 'not_found';

    const { data: challenge } = await supabase
      .from('challenges')
      .select('id')
      .eq('invite_code', code.trim().toUpperCase())
      .maybeSingle();

    if (!challenge) return 'not_found';

    const { data: existing } = await supabase
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', challenge.id as string)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) return 'already_in';

    const { error } = await supabase.from('challenge_participants').insert({
      challenge_id: challenge.id,
      user_id: user.id,
      display_name: user.email ?? 'Anonymous',
      status: 'joined',
    });

    if (error) return 'not_found';
    await fetchChallenges();
    return 'joined';
  }, [user, fetchChallenges]);

  const submitToChallenge = useCallback(async (
    challengeId: string,
    exercises: LoggedExercise[],
  ): Promise<boolean> => {
    if (!user) return false;

    const score = await computeScore(user.id, exercises);

    const { error } = await supabase.from('challenge_submissions').insert({
      challenge_id: challengeId,
      user_id: user.id,
      display_name: user.email ?? 'Anonymous',
      exercises,
      score,
    });

    if (error) return false;

    await supabase
      .from('challenge_participants')
      .update({ status: 'submitted' })
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id);

    const { data: pRows } = await supabase
      .from('challenge_participants')
      .select('status')
      .eq('challenge_id', challengeId);

    if (pRows && pRows.every(p => p.status === 'submitted')) {
      await supabase
        .from('challenges')
        .update({ status: 'complete' })
        .eq('id', challengeId);
    }

    await fetchChallenges();
    return true;
  }, [user, fetchChallenges]);

  const deleteChallenge = useCallback(async (challengeId: string): Promise<void> => {
    if (!user) return;
    await supabase.from('challenges').delete().eq('id', challengeId).eq('created_by', user.id);
    await fetchChallenges();
  }, [user, fetchChallenges]);

  return { challenges, loading, createChallenge, joinChallenge, submitToChallenge, deleteChallenge };
}
