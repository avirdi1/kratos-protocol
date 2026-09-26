import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkoutLog } from '../hooks/useWorkoutLog';
import { useCustomPlans } from '../hooks/useCustomPlans';
import { useChallenges } from '../hooks/useChallenges';
import type { ChallengeWithDetails } from '../hooks/useChallenges';
import LogWorkoutModal from '../components/LogWorkoutModal';
import CreatePlanModal from '../components/CreatePlanModal';
import ChallengeModal from '../components/ChallengeModal';
import { BEGINNER_PPL, EXERCISES } from '../data/workoutPlans';
import type { WorkoutLog, WorkoutPlan } from '../data/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatRestTime(seconds: number): string {
  return seconds >= 60 ? `${seconds / 60} min` : `${seconds}s`;
}


const TYPE_STYLE: Record<string, { badge: string; border: string; dot: string }> = {
  Push:  { badge: 'bg-blue-600',   border: 'border-blue-600/40',   dot: 'bg-blue-500'   },
  Pull:  { badge: 'bg-green-600',  border: 'border-green-600/40',  dot: 'bg-green-500'  },
  Legs:  { badge: 'bg-purple-600', border: 'border-purple-600/40', dot: 'bg-purple-500' },
  Other: { badge: 'bg-slate-600',  border: 'border-slate-600/40',  dot: 'bg-slate-400'  },
};

// ── Week Calendar ─────────────────────────────────────────────────────────────

function WeekCalendar({ loggedDates }: { loggedDates: Set<string> }) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const week = days.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, iso: toISODate(d), date: d };
  });

  const todayISO = toISODate(now);

  return (
    <div className="bg-kratos-darker border border-kratos-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-kratos-text-dim uppercase tracking-wider mb-4">This Week</h3>
      <div className="grid grid-cols-7 gap-2">
        {week.map(({ label, iso }) => {
          const logged = loggedDates.has(iso);
          const isToday = iso === todayISO;
          return (
            <div key={iso} className="flex flex-col items-center gap-2">
              <span className={`text-xs font-medium ${isToday ? 'text-kratos-blue' : 'text-kratos-text-dim'}`}>
                {label}
              </span>
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold
                  transition-all
                  ${logged
                    ? 'bg-kratos-blue-dark text-white'
                    : isToday
                      ? 'border-2 border-kratos-blue text-kratos-blue'
                      : 'bg-kratos-dark text-kratos-text-dim'}
                `}
              >
                {logged ? '✓' : new Date(iso + 'T00:00:00').getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Session Card ──────────────────────────────────────────────────────────────

function SessionCard({
  log,
  onDelete,
  onEdit,
}: {
  log: WorkoutLog;
  onDelete: (id: string) => void;
  onEdit: (log: WorkoutLog) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const style = TYPE_STYLE[log.type] ?? TYPE_STYLE.Other;
  return (
    <div className={`bg-kratos-darker border ${style.border} rounded-xl overflow-hidden transition-all`}>
      {/* Summary row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-kratos-dark/40 transition-colors"
      >
        <div className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{log.planName ?? `${log.type} Day`}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge} text-white`}>
              {log.type}
            </span>
          </div>
          <div className="text-kratos-text-dim text-sm mt-0.5">
            {formatDisplayDate(log.date)} · {log.exercises.length} exercise{log.exercises.length !== 1 ? 's' : ''}
          </div>
        </div>
        <span className="text-kratos-text-dim text-lg shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-kratos-border px-5 py-4 space-y-4">
          {log.exercises.map(ex => (
            <div key={ex.exerciseId}>
              <p className="font-medium mb-2">{ex.exerciseName}</p>
              <div className="grid grid-cols-[2rem_1fr_1fr] gap-x-4 gap-y-1 text-sm">
                <span className="text-kratos-text-dim text-xs">Set</span>
                <span className="text-kratos-text-dim text-xs">Weight</span>
                <span className="text-kratos-text-dim text-xs">Reps</span>
                {ex.sets.map((s, i) => (
                  <>
                    <span key={`set-${i}`} className="text-kratos-text-dim">{i + 1}</span>
                    <span key={`w-${i}`}>{s.weight} {s.unit}</span>
                    <span key={`r-${i}`}>{s.reps}</span>
                  </>
                ))}
              </div>
            </div>
          ))}
          {log.notes && (
            <p className="text-kratos-text-dim text-sm italic border-t border-kratos-border pt-3">
              "{log.notes}"
            </p>
          )}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => onEdit(log)}
              className="text-sm text-kratos-blue hover:text-blue-300 transition-colors"
            >
              Edit Session
            </button>
            <button
              onClick={() => onDelete(log.id)}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Delete Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, onUse }: { plan: WorkoutPlan; onUse: (plan: WorkoutPlan) => void }) {
  const style = TYPE_STYLE[plan.type] ?? TYPE_STYLE.Other;
  const restNote = formatRestTime(plan.exercises[0]?.restSeconds ?? 120);

  return (
    <div className={`bg-kratos-darker border ${style.border} hover:border-opacity-80 rounded-xl p-5 flex flex-col gap-4 transition-all`}>
      {/* Badge + day */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.badge} text-white`}>
          {plan.type.toUpperCase()}
        </span>
        <span className="text-kratos-text-dim text-xs">{plan.scheduledDay}</span>
      </div>

      {/* Title + meta */}
      <div>
        <h3 className="text-lg font-bold">{plan.name}</h3>
        <p className="text-kratos-text-dim text-xs mt-1">
          ~{plan.estimatedMinutes} min · {plan.exercises.length} exercises · {restNote} rest
        </p>
      </div>

      {/* Description */}
      <p className="text-kratos-text-dim text-sm leading-relaxed">{plan.description}</p>

      {/* Exercise list */}
      <ul className="space-y-2">
        {plan.exercises.map(pe => (
          <li key={pe.exercise.id} className="flex items-center justify-between text-sm">
            <span>{pe.exercise.name}</span>
            <span className="text-kratos-text-dim text-xs">
              {pe.sets} × {pe.targetReps} reps
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onUse(plan)}
        className={`mt-auto w-full ${style.badge} hover:opacity-90 text-white font-semibold py-2.5 rounded-lg transition-opacity`}
      >
        Start This Workout
      </button>
    </div>
  );
}

// ── Challenge Card ────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 1.05) return 'text-green-400';
  if (score <= 0.95) return 'text-red-400';
  return 'text-kratos-text-dim';
}

function ChallengeCard({
  challenge,
  currentUserId,
  onSubmit,
  onDelete,
}: {
  challenge: ChallengeWithDetails;
  currentUserId: string;
  onSubmit: (c: ChallengeWithDetails) => void;
  onDelete: (id: string) => void;
}) {
  const isComplete = challenge.status === 'complete';
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!isComplete);
  const hasSubmitted = !!challenge.mySubmission;
  const isCreator = challenge.createdBy === currentUserId;
  const typeStyle = TYPE_STYLE[challenge.workoutType] ?? TYPE_STYLE.Other;

  function copyCode() {
    navigator.clipboard.writeText(challenge.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sortedSubmissions = [...challenge.submissions].sort((a, b) => b.score - a.score);

  return (
    <div className={`bg-kratos-darker border ${isComplete ? 'border-kratos-border' : typeStyle.border} rounded-xl overflow-hidden`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-kratos-dark/40 transition-colors"
      >
        <div className={`w-2 h-2 rounded-full shrink-0 ${typeStyle.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{challenge.title}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeStyle.badge} text-white`}>
              {challenge.workoutType}
            </span>
            {isComplete && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-kratos-border text-kratos-text-dim">
                COMPLETE
              </span>
            )}
          </div>
          <div className="text-kratos-text-dim text-sm mt-0.5">
            {challenge.participants.length} participant{challenge.participants.length !== 1 ? 's' : ''}
            {' · '}
            {challenge.exerciseNames.slice(0, 3).join(', ')}{challenge.exerciseNames.length > 3 ? '…' : ''}
          </div>
        </div>
        <span className="text-kratos-text-dim text-lg shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-kratos-border px-5 py-4 space-y-4">

          {/* Participants */}
          <div>
            <p className="text-xs font-semibold text-kratos-text-dim uppercase tracking-wider mb-2">Participants</p>
            <div className="space-y-1.5">
              {challenge.participants.map(p => (
                <div key={p.userId} className="flex items-center justify-between text-sm">
                  <span className={p.userId === currentUserId ? 'text-kratos-blue' : 'text-kratos-text'}>
                    {p.userId === currentUserId ? 'You' : p.displayName}
                  </span>
                  <span className={p.status === 'submitted' ? 'text-green-400' : 'text-kratos-text-dim'}>
                    {p.status === 'submitted' ? '✓ submitted' : '⏳ pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          {isComplete && sortedSubmissions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-kratos-text-dim uppercase tracking-wider mb-2">Results</p>
              <div className="space-y-2">
                {sortedSubmissions.map((sub, i) => (
                  <div key={sub.userId} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {i === 0 && <span>🏆</span>}
                      <span className={sub.userId === currentUserId ? 'text-kratos-blue' : 'text-kratos-text'}>
                        {sub.userId === currentUserId ? 'You' : sub.displayName}
                      </span>
                    </span>
                    <span className={`font-semibold ${scoreColor(sub.score)}`}>
                      {Math.round(sub.score * 100)}%
                      <span className="text-xs font-normal text-kratos-text-dim ml-1">of baseline</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exercises */}
          <div>
            <p className="text-xs font-semibold text-kratos-text-dim uppercase tracking-wider mb-2">Exercises</p>
            <div className="flex flex-wrap gap-1.5">
              {challenge.exerciseNames.map(name => (
                <span key={name} className="text-xs px-2 py-1 bg-kratos-dark border border-kratos-border rounded-md text-kratos-text-dim">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Log & Submit — prominent, full width */}
          {!isComplete && !hasSubmitted && (
            <button
              onClick={() => onSubmit(challenge)}
              className={`w-full ${typeStyle.badge} hover:opacity-90 text-white font-semibold py-2.5 rounded-lg transition-opacity`}
            >
              Log &amp; Submit Workout
            </button>
          )}

          {!isComplete && hasSubmitted && (
            <p className="text-center text-sm text-green-400">✓ You've submitted — waiting on others</p>
          )}

          {/* Footer row: invite code + delete */}
          <div className="flex items-center justify-between pt-1 border-t border-kratos-border">
            {!isComplete ? (
              <div className="text-sm">
                <span className="text-kratos-text-dim">Code: </span>
                <span className="font-mono font-bold text-kratos-blue tracking-widest">{challenge.inviteCode}</span>
                <button onClick={copyCode} className="ml-2 text-xs text-kratos-text-dim hover:text-kratos-text transition-colors">
                  {copied ? 'copied!' : 'copy'}
                </button>
              </div>
            ) : (
              <span />
            )}
            {isCreator && (
              <button
                onClick={() => onDelete(challenge.id)}
                className="text-xs text-kratos-text-dim hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Workouts() {
  const { user } = useAuth();
  const { logs, addLog, deleteLog, updateLog, loggedDates } = useWorkoutLog();
  const { plans: customPlans, addPlan, deletePlan } = useCustomPlans();
  const { challenges, createChallenge, joinChallenge, submitToChallenge, deleteChallenge } = useChallenges();

  const [modalOpen, setModalOpen] = useState(false);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [challengeModalTab, setChallengeModalTab] = useState<'create' | 'join'>('create');
  const [prefillPlan, setPrefillPlan] = useState<WorkoutPlan | undefined>();
  const [editingLog, setEditingLog] = useState<WorkoutLog | undefined>();
  const [challengeSubmitId, setChallengeSubmitId] = useState<string | undefined>();

  function openLogModal(plan?: WorkoutPlan) {
    setPrefillPlan(plan);
    setEditingLog(undefined);
    setChallengeSubmitId(undefined);
    setModalOpen(true);
  }

  function openEditModal(log: WorkoutLog) {
    setEditingLog(log);
    setPrefillPlan(undefined);
    setChallengeSubmitId(undefined);
    setModalOpen(true);
  }

  function openSubmitModal(challenge: ChallengeWithDetails) {
    const fakePlan: WorkoutPlan = {
      id: challenge.id,
      name: challenge.title,
      type: challenge.workoutType,
      estimatedMinutes: 60,
      description: '',
      scheduledDay: '',
      exercises: challenge.exerciseIds.map((id, i) => {
        const ex = EXERCISES.find(e => e.id === id);
        return {
          exercise: ex ?? { id, name: challenge.exerciseNames[i], muscleGroup: '', category: challenge.workoutType },
          sets: 3,
          targetReps: 10,
          restSeconds: 90,
        };
      }),
    };
    setPrefillPlan(fakePlan);
    setChallengeSubmitId(challenge.id);
    setEditingLog(undefined);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setPrefillPlan(undefined);
    setEditingLog(undefined);
    setChallengeSubmitId(undefined);
  }

  function handleModalSave(log: WorkoutLog) {
    if (challengeSubmitId) {
      addLog(log);
      submitToChallenge(challengeSubmitId, log.exercises);
    } else if (editingLog) {
      updateLog(log);
    } else {
      addLog(log);
    }
  }

  return (
    <div className="space-y-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Workouts</h1>
          <p className="text-kratos-text-dim mt-1">Beginner Push · Pull · Legs program</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCreatePlanOpen(true)}
            className="bg-kratos-dark hover:bg-kratos-border border border-kratos-border text-kratos-text font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            + Create Plan
          </button>
          <button
            onClick={() => openLogModal()}
            className="bg-kratos-blue-dark hover:bg-kratos-blue-darker text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            + Log Workout
          </button>
        </div>
      </div>

      {/* ── Beginner Plan ── */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Beginner PPL Plan
          <span className="text-kratos-text-dim text-sm font-normal ml-2">3 days / week</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {BEGINNER_PPL.map(plan => (
            <PlanCard key={plan.id} plan={plan} onUse={openLogModal} />
          ))}
        </div>
      </section>

      {/* ── Custom Plans ── */}
      {customPlans.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">
            My Plans
            <span className="text-kratos-text-dim text-sm font-normal ml-2">{customPlans.length} custom</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {customPlans.map(plan => (
              <div key={plan.id} className="relative">
                <PlanCard plan={plan} onUse={openLogModal} />
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="absolute top-3 right-3 text-xs text-kratos-text-dim hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Week Calendar ── */}
      <WeekCalendar loggedDates={loggedDates} />

      {/* ── Challenges ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Challenges
            {challenges.length > 0 && (
              <span className="text-kratos-text-dim text-sm font-normal ml-2">{challenges.length} active</span>
            )}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => { setChallengeModalTab('join'); setChallengeModalOpen(true); }}
              className="border border-kratos-border text-kratos-text-dim hover:text-kratos-text text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              Join by Code
            </button>
            <button
              onClick={() => { setChallengeModalTab('create'); setChallengeModalOpen(true); }}
              className="bg-kratos-blue-dark hover:bg-kratos-blue-darker text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              + Create
            </button>
          </div>
        </div>

        {challenges.length === 0 ? (
          <div className="bg-kratos-darker border border-kratos-border rounded-xl p-8 text-center">
            <p className="text-kratos-text-dim text-sm">No challenges yet.</p>
            <p className="text-kratos-text-dim text-xs mt-1">Create one and share the code with a friend to compete.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map(c => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                currentUserId={user?.id ?? ''}
                onSubmit={openSubmitModal}
                onDelete={deleteChallenge}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── History ── */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Workout History
          <span className="text-kratos-text-dim text-sm font-normal ml-2">{logs.length} session{logs.length !== 1 ? 's' : ''}</span>
        </h2>
        {logs.length === 0 ? (
          <div className="bg-kratos-darker border border-kratos-border rounded-xl p-10 text-center">
            <p className="text-kratos-text-dim">No sessions logged yet.</p>
            <button
              onClick={() => openLogModal()}
              className="mt-4 bg-kratos-blue-dark hover:bg-kratos-blue-darker text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Log Your First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <SessionCard key={log.id} log={log} onDelete={deleteLog} onEdit={openEditModal} />
            ))}
          </div>
        )}
      </section>

      {/* ── Modals ── */}
      {modalOpen && (
        <LogWorkoutModal
          onSave={handleModalSave}
          onClose={closeModal}
          prefillPlan={prefillPlan}
          editLog={editingLog}
        />
      )}
      {createPlanOpen && (
        <CreatePlanModal
          onSave={addPlan}
          onClose={() => setCreatePlanOpen(false)}
        />
      )}
      {challengeModalOpen && (
        <ChallengeModal
          onClose={() => setChallengeModalOpen(false)}
          defaultTab={challengeModalTab}
          onCreate={createChallenge}
          onJoin={joinChallenge}
        />
      )}
    </div>
  );
}
