import { useState } from 'react';
import type { DayType, WorkoutPlan, PlanExercise } from '../data/types';
import { EXERCISES, getExercisesByCategory } from '../data/workoutPlans';

interface Props {
  onSave: (plan: WorkoutPlan) => void;
  onClose: () => void;
}

const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Any Day'];
const TYPE_OPTIONS: { type: DayType; color: string }[] = [
  { type: 'Push',  color: 'bg-blue-500'   },
  { type: 'Pull',  color: 'bg-green-500'  },
  { type: 'Legs',  color: 'bg-purple-500' },
  { type: 'Other', color: 'bg-slate-500'  },
];

export default function CreatePlanModal({ onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<DayType>('Push');
  const [scheduledDay, setScheduledDay] = useState('Monday');
  const [description, setDescription] = useState('');
  const [planExercises, setPlanExercises] = useState<PlanExercise[]>([]);
  const [search, setSearch] = useState('');

  const available = getExercisesByCategory(type).filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) &&
    !planExercises.find(pe => pe.exercise.id === e.id)
  );

  function addExercise(id: string) {
    const ex = EXERCISES.find(e => e.id === id);
    if (!ex) return;
    setPlanExercises(prev => [
      ...prev,
      { exercise: ex, sets: 3, targetReps: 10, restSeconds: 90 },
    ]);
    setSearch('');
  }

  function removeExercise(idx: number) {
    setPlanExercises(prev => prev.filter((_, i) => i !== idx));
  }

  function updateExercise(idx: number, field: 'sets' | 'targetReps' | 'restSeconds', value: number) {
    setPlanExercises(prev =>
      prev.map((pe, i) => i === idx ? { ...pe, [field]: value } : pe)
    );
  }

  function handleSave() {
    if (!name.trim() || planExercises.length === 0) return;
    const totalSets = planExercises.reduce((s, pe) => s + pe.sets, 0);
    const avgRest = Math.round(
      planExercises.reduce((s, pe) => s + pe.restSeconds, 0) / planExercises.length
    );
    // Rough estimate: (sets × 45s work) + (sets × rest) + 5min warmup
    const estimated = Math.round((totalSets * 45 + totalSets * avgRest) / 60) + 5;

    const plan: WorkoutPlan = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      type,
      scheduledDay,
      description: description.trim(),
      estimatedMinutes: estimated,
      exercises: planExercises,
    };
    onSave(plan);
    onClose();
  }

  const typeColor = TYPE_OPTIONS.find(t => t.type === type)?.color ?? 'bg-slate-500';
  const canSave = name.trim().length > 0 && planExercises.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Create Custom Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. My Push Day, Upper Body A…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Type + Day */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <div className="flex gap-2 flex-wrap">
                {TYPE_OPTIONS.map(t => (
                  <button
                    key={t.type}
                    onClick={() => setType(t.type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      type === t.type
                        ? `${t.color} text-white`
                        : 'border border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {t.type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Day</label>
              <select
                value={scheduledDay}
                onChange={e => setScheduledDay(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                {DAY_OPTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Notes about this plan…"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Exercises */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Exercises
              <span className="text-gray-400 font-normal ml-1">({planExercises.length} added)</span>
            </label>

            {planExercises.length > 0 && (
              <div className="space-y-3 mb-4">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_4rem_4rem_5rem_2rem] gap-2 text-xs text-gray-400 px-1">
                  <span>Exercise</span>
                  <span>Sets</span>
                  <span>Reps</span>
                  <span>Rest</span>
                  <span />
                </div>
                {planExercises.map((pe, idx) => (
                  <div key={pe.exercise.id} className="grid grid-cols-[1fr_4rem_4rem_5rem_2rem] gap-2 items-center bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{pe.exercise.name}</p>
                      <p className="text-xs text-gray-400">{pe.exercise.muscleGroup}</p>
                    </div>
                    <input
                      type="number" min={1} max={10}
                      value={pe.sets}
                      onChange={e => updateExercise(idx, 'sets', Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    <input
                      type="number" min={1} max={50}
                      value={pe.targetReps}
                      onChange={e => updateExercise(idx, 'targetReps', Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    <select
                      value={pe.restSeconds}
                      onChange={e => updateExercise(idx, 'restSeconds', Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-1 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value={30}>30s</option>
                      <option value={60}>1 min</option>
                      <option value={90}>90s</option>
                      <option value={120}>2 min</option>
                      <option value={150}>2.5 min</option>
                      <option value={180}>3 min</option>
                    </select>
                    <button
                      onClick={() => removeExercise(idx)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Exercise search */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <input
                type="text"
                placeholder={`Search ${type} exercises…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
              <div className="max-h-40 overflow-y-auto space-y-0.5">
                {available.slice(0, 25).map(ex => (
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
          </div>

          {/* Preview */}
          {planExercises.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Plan Preview</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`${typeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {type.toUpperCase()}
                </span>
                <span className="text-sm text-gray-600">{name || 'Untitled Plan'}</span>
                <span className="text-xs text-gray-400">
                  ~{Math.round((planExercises.reduce((s, pe) => s + pe.sets, 0) * 45 +
                    planExercises.reduce((s, pe) => s + pe.restSeconds, 0)) / 60) + 5} min
                  · {planExercises.length} exercises
                </span>
              </div>
            </div>
          )}
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
            disabled={!canSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}
