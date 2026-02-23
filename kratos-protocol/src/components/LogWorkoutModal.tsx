import { useState } from 'react';
import type { DayType, LoggedExercise, LoggedSet, WorkoutLog } from '../data/types';
import { EXERCISES, getExercisesByCategory } from '../data/workoutPlans';
import type { WorkoutPlan } from '../data/types';

interface Props {
  onSave: (log: WorkoutLog) => void;
  onClose: () => void;
  prefillPlan?: WorkoutPlan;
  editLog?: WorkoutLog; // when present, modal is in edit mode
}

const DAY_TYPES: { type: DayType; label: string; sub: string; color: string; ring: string }[] = [
  { type: 'Push',  label: 'Push',  sub: 'Chest · Shoulders · Triceps', color: 'bg-blue-500',   ring: 'ring-blue-500'   },
  { type: 'Pull',  label: 'Pull',  sub: 'Back · Biceps · Rear Delt',   color: 'bg-green-500',  ring: 'ring-green-500'  },
  { type: 'Legs',  label: 'Legs',  sub: 'Quads · Hamstrings · Glutes', color: 'bg-purple-500', ring: 'ring-purple-500' },
  { type: 'Other', label: 'Other', sub: 'Custom / Full Body',           color: 'bg-slate-500',  ring: 'ring-slate-400'  },
];

function emptySet(): LoggedSet {
  return { reps: 0, weight: 0, unit: 'lbs' };
}

export default function LogWorkoutModal({ onSave, onClose, prefillPlan, editLog }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const isEditing = !!editLog;

  const [step, setStep] = useState<1 | 2>(prefillPlan || editLog ? 2 : 1);
  const [dayType, setDayType] = useState<DayType>(editLog?.type ?? prefillPlan?.type ?? 'Push');
  const [date, setDate] = useState(editLog?.date ?? today);
  const [notes, setNotes] = useState(editLog?.notes ?? '');
  const [exercises, setExercises] = useState<LoggedExercise[]>(() => {
    if (editLog) return editLog.exercises;
    if (prefillPlan) {
      return prefillPlan.exercises.map(pe => ({
        exerciseId: pe.exercise.id,
        exerciseName: pe.exercise.name,
        sets: Array.from({ length: pe.sets }, () => emptySet()),
      }));
    }
    return [];
  });
  const [exerciseSearch, setExerciseSearch] = useState('');

  const available = getExercisesByCategory(dayType).filter(e =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) &&
    !exercises.find(ex => ex.exerciseId === e.id)
  );

  function addExercise(id: string) {
    const ex = EXERCISES.find(e => e.id === id);
    if (!ex) return;
    setExercises(prev => [
      ...prev,
      { exerciseId: ex.id, exerciseName: ex.name, sets: [emptySet()] },
    ]);
    setExerciseSearch('');
  }

  function removeExercise(idx: number) {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  }

  function addSet(exIdx: number) {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: [...ex.sets, emptySet()] } : ex
      )
    );
  }

  function removeSet(exIdx: number, setIdx: number) {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
          : ex
      )
    );
  }

  function updateSet(exIdx: number, setIdx: number, field: keyof LoggedSet, value: string | number) {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === setIdx ? { ...s, [field]: field === 'unit' ? value : Number(value) } : s
              ),
            }
          : ex
      )
    );
  }

  function handleSave() {
    if (exercises.length === 0) return;
    const log: WorkoutLog = {
      // preserve ID when editing so updateLog replaces the right entry
      id: editLog?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date,
      type: dayType,
      planId: editLog?.planId ?? prefillPlan?.id,
      planName: editLog?.planName ?? prefillPlan?.name,
      exercises,
      notes: notes.trim() || undefined,
    };
    onSave(log);
    onClose();
  }

  const typeConfig = DAY_TYPES.find(d => d.type === dayType)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — pure white */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? `Edit ${dayType} Session` : step === 1 ? 'Log Workout' : `Log ${dayType} Day`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* ── Step 1: Pick Day Type ── */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <p className="text-gray-500 mb-6 font-medium">What are you training today?</p>
            <div className="grid grid-cols-2 gap-4">
              {DAY_TYPES.map(d => (
                <button
                  key={d.type}
                  onClick={() => { setDayType(d.type); setStep(2); }}
                  className="border-2 border-gray-200 hover:border-gray-300 rounded-xl p-6 text-left hover:shadow-md transition-all group"
                >
                  <div className={`w-3 h-3 rounded-full ${d.color} mb-3`} />
                  <div className="text-xl font-bold text-gray-900 mb-1">{d.label}</div>
                  <div className="text-sm text-gray-400">{d.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Log Exercises ── */}
        {step === 2 && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

              {/* Top bar: back + badge + date */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
                >
                  ← Back
                </button>
                <span className={`${typeConfig.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {dayType.toUpperCase()}
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="ml-auto border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Empty state */}
              {exercises.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-3">
                  Add an exercise below to get started.
                </p>
              )}

              {/* Logged exercises */}
              {exercises.map((ex, exIdx) => (
                <div key={ex.exerciseId} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900">{ex.exerciseName}</span>
                      <span className="text-gray-400 text-xs ml-2">
                        {EXERCISES.find(e => e.id === ex.exerciseId)?.muscleGroup}
                      </span>
                    </div>
                    <button
                      onClick={() => removeExercise(exIdx)}
                      className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Column headers */}
                  <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-xs text-gray-400 px-1">
                    <span>Set</span>
                    <span>Weight</span>
                    <span>Reps</span>
                    <span />
                  </div>

                  {/* Sets */}
                  {ex.sets.map((s, setIdx) => (
                    <div key={setIdx} className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center">
                      <span className="text-gray-400 text-sm text-center">{setIdx + 1}</span>

                      <div className="flex gap-1">
                        <input
                          type="number"
                          min={0}
                          value={s.weight || ''}
                          placeholder="0"
                          onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                          className="w-full border border-gray-300 text-gray-900 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                        <select
                          value={s.unit}
                          onChange={e => updateSet(exIdx, setIdx, 'unit', e.target.value)}
                          className="border border-gray-300 text-gray-500 rounded-lg px-1 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        >
                          <option value="lbs">lbs</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>

                      <input
                        type="number"
                        min={0}
                        value={s.reps || ''}
                        placeholder="0"
                        onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                        className="border border-gray-300 text-gray-900 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />

                      <button
                        onClick={() => removeSet(exIdx, setIdx)}
                        disabled={ex.sets.length === 1}
                        className="text-gray-300 hover:text-red-400 disabled:opacity-30 text-center transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addSet(exIdx)}
                    className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
                  >
                    + Add Set
                  </button>
                </div>
              ))}

              {/* Add exercise picker */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <p className="text-sm font-semibold text-gray-700 mb-3">Add Exercise</p>
                <input
                  type="text"
                  placeholder={`Search ${dayType} exercises…`}
                  value={exerciseSearch}
                  onChange={e => setExerciseSearch(e.target.value)}
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {available.slice(0, 30).map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => addExercise(ex.id)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center justify-between group"
                    >
                      <div>
                        <span className="text-sm text-gray-800 font-medium">{ex.name}</span>
                        {ex.equipment && (
                          <span className="ml-2 text-xs text-gray-400">{ex.equipment}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                        {ex.muscleGroup} · +
                      </span>
                    </button>
                  ))}
                  {available.length === 0 && (
                    <p className="text-gray-400 text-xs px-3 py-2">No exercises found.</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes (optional)…"
                rows={2}
                className="w-full border border-gray-200 text-gray-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 placeholder-gray-400"
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 shrink-0 bg-white">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={exercises.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {isEditing ? 'Save Changes' : 'Save Workout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
