import { useState } from 'react';
import type { DayType } from '../data/types';
import { EXERCISES, getExercisesByCategory } from '../data/workoutPlans';

interface Props {
  onClose: () => void;
  defaultTab?: 'create' | 'join';
  onCreate: (
    title: string,
    workoutType: DayType,
    exerciseIds: string[],
    exerciseNames: string[],
  ) => Promise<string | null>;
  onJoin: (code: string) => Promise<'joined' | 'already_in' | 'not_found'>;
}

const DAY_TYPES: { type: DayType; label: string; sub: string; color: string }[] = [
  { type: 'Push',  label: 'Push',  sub: 'Chest · Shoulders · Triceps', color: 'bg-blue-500'   },
  { type: 'Pull',  label: 'Pull',  sub: 'Back · Biceps · Rear Delt',   color: 'bg-green-500'  },
  { type: 'Legs',  label: 'Legs',  sub: 'Quads · Hamstrings · Glutes', color: 'bg-purple-500' },
  { type: 'Other', label: 'Other', sub: 'Custom / Full Body',           color: 'bg-slate-500'  },
];

export default function ChallengeModal({ onClose, defaultTab = 'create', onCreate, onJoin }: Props) {
  const [tab, setTab] = useState<'create' | 'join'>(defaultTab);

  // ── Create state ──
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [createError, setCreateError] = useState('');
  const [title, setTitle] = useState('');
  const [workoutType, setWorkoutType] = useState<DayType>('Push');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Join state ──
  const [joinCode, setJoinCode] = useState('');
  const [joinResult, setJoinResult] = useState<'joined' | 'already_in' | 'not_found' | null>(null);
  const [joining, setJoining] = useState(false);

  const available = getExercisesByCategory(workoutType).filter(e =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) &&
    !selectedIds.includes(e.id)
  );

  function toggleExercise(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function handleCreate() {
    if (selectedIds.length === 0) return;
    setCreating(true);
    setCreateError('');
    const names = selectedIds.map(id => EXERCISES.find(e => e.id === id)?.name ?? id);
    const code = await onCreate(title.trim() || `${workoutType} Challenge`, workoutType, selectedIds, names);
    setCreating(false);
    if (code) {
      setCreatedCode(code);
      setCreateStep(3);
    } else {
      setCreateError('Failed to create challenge. Make sure you have run supabase_social.sql in your Supabase project.');
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setJoining(true);
    const result = await onJoin(joinCode);
    setJoining(false);
    setJoinResult(result);
  }

  function copyCode() {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Challenges</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none">
            ✕
          </button>
        </div>

        {/* Tabs */}
        {createStep < 3 && (
          <div className="flex border-b border-gray-200 shrink-0">
            {(['create', 'join'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
                  tab === t
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'create' ? 'Create Challenge' : 'Join by Code'}
              </button>
            ))}
          </div>
        )}

        {/* ── CREATE flow ── */}
        {tab === 'create' && (
          <div className="flex-1 overflow-y-auto">

            {/* Step 1: title + type */}
            {createStep === 1 && (
              <div className="px-6 py-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Challenge name <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Friday Push Battle"
                    className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Workout type</p>
                  <div className="grid grid-cols-2 gap-3">
                    {DAY_TYPES.map(d => (
                      <button
                        key={d.type}
                        onClick={() => setWorkoutType(d.type)}
                        className={`border-2 rounded-xl p-4 text-left transition-all ${
                          workoutType === d.type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${d.color} mb-2`} />
                        <div className="font-bold text-gray-900 text-sm">{d.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{d.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCreateStep(2)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Next — Pick Exercises
                </button>
              </div>
            )}

            {/* Step 2: pick exercises */}
            {createStep === 2 && (
              <div className="px-6 py-4 space-y-4">
                <button
                  onClick={() => setCreateStep(1)}
                  className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  ← Back
                </button>

                {selectedIds.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Selected ({selectedIds.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedIds.map(id => {
                        const ex = EXERCISES.find(e => e.id === id);
                        return (
                          <button
                            key={id}
                            onClick={() => toggleExercise(id)}
                            className="flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                            {ex?.name ?? id} ✕
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <input
                    type="text"
                    placeholder={`Search ${workoutType} exercises…`}
                    value={exerciseSearch}
                    onChange={e => setExerciseSearch(e.target.value)}
                    className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                  <div className="max-h-52 overflow-y-auto space-y-0.5">
                    {available.slice(0, 30).map(ex => (
                      <button
                        key={ex.id}
                        onClick={() => toggleExercise(ex.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center justify-between group"
                      >
                        <span className="text-sm text-gray-800 font-medium">{ex.name}</span>
                        <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                          {ex.muscleGroup} · +
                        </span>
                      </button>
                    ))}
                    {available.length === 0 && (
                      <p className="text-gray-400 text-xs px-3 py-2">No more exercises.</p>
                    )}
                  </div>
                </div>

                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                    {createError}
                  </div>
                )}

                <button
                  onClick={handleCreate}
                  disabled={selectedIds.length === 0 || creating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {creating ? 'Creating…' : 'Create Challenge'}
                </button>
              </div>
            )}

            {/* Step 3: success + invite code */}
            {createStep === 3 && (
              <div className="px-6 py-8 text-center space-y-6">
                <div>
                  <div className="text-4xl mb-3">🏆</div>
                  <h3 className="text-xl font-bold text-gray-900">Challenge created!</h3>
                  <p className="text-gray-500 text-sm mt-1">Share this code with your friends</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <p className="text-5xl font-black text-gray-900 tracking-widest">{createdCode}</p>
                </div>

                <button
                  onClick={copyCode}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── JOIN flow ── */}
        {tab === 'join' && (
          <div className="flex-1 px-6 py-6 space-y-4">
            <p className="text-sm text-gray-500">Enter the 6-character code your friend shared.</p>

            <input
              type="text"
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinResult(null); }}
              placeholder="ABC123"
              maxLength={6}
              className="w-full text-center text-2xl font-black tracking-widest border border-gray-300 text-gray-900 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white uppercase"
            />

            {joinResult === 'joined' && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
                Joined! You'll see the challenge on your Workouts page.
              </div>
            )}
            {joinResult === 'already_in' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700 font-medium">
                You're already in this challenge.
              </div>
            )}
            {joinResult === 'not_found' && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 font-medium">
                Code not found. Check with your friend and try again.
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={joinCode.length < 6 || joining || joinResult === 'joined'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {joining ? 'Joining…' : joinResult === 'joined' ? 'Joined!' : 'Join Challenge'}
            </button>

            {joinResult === 'joined' && (
              <button onClick={onClose} className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors">
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
