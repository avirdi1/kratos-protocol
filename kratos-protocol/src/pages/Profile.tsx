import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkoutLog } from '../hooks/useWorkoutLog';

const TYPE_COLOR: Record<string, string> = {
  Push:  'bg-blue-600',
  Pull:  'bg-green-600',
  Legs:  'bg-purple-600',
  Other: 'bg-slate-600',
};

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function Profile() {
  const { logs, getStreak, getTotalVolume } = useWorkoutLog();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('Demo User');
  const [email, setEmail] = useState('demo@kratos.app');
  const [draftName, setDraftName] = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);

  const streak = getStreak();
  const totalVol = getTotalVolume();
  const recentLogs = logs.slice(0, 5);

  // Compute personal records: unique exercises logged
  const uniqueExercises = new Set(
    logs.flatMap(l => l.exercises.map(e => e.exerciseId))
  ).size;

  function saveProfile() {
    setName(draftName.trim() || name);
    setEmail(draftEmail.trim() || email);
    setEditing(false);
  }

  function cancelEdit() {
    setDraftName(name);
    setDraftEmail(email);
    setEditing(false);
  }

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const memberSince = logs.length > 0
    ? new Date(Math.min(...logs.map(l => new Date(l.date).getTime()))).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'No sessions yet';

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Profile Header ── */}
      <div className="bg-kratos-darker border border-kratos-border rounded-xl p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-kratos-blue-dark flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {initials}
          </div>

          {editing ? (
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-kratos-dark border border-kratos-border text-kratos-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-kratos-blue"
              />
              <input
                type="email"
                value={draftEmail}
                onChange={e => setDraftEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-kratos-dark border border-kratos-border text-kratos-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-kratos-blue"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveProfile}
                  className="bg-kratos-blue-dark hover:bg-kratos-blue-darker text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-kratos-dark hover:bg-kratos-border border border-kratos-border text-kratos-text font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-kratos-text-dim">{email}</p>
              <p className="text-sm text-kratos-text-dim mt-1">
                {logs.length > 0 ? `Training since ${memberSince}` : 'No sessions logged yet'}
              </p>
              <button
                onClick={() => { setDraftName(name); setDraftEmail(email); setEditing(true); }}
                className="mt-3 text-sm text-kratos-blue hover:underline transition-colors"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-kratos-darker border border-kratos-border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-kratos-blue mb-1">{logs.length}</div>
          <div className="text-kratos-text-dim text-sm">Total Sessions</div>
        </div>
        <div className="bg-kratos-darker border border-kratos-border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-orange-400 mb-1">{streak}</div>
          <div className="text-kratos-text-dim text-sm">Day Streak</div>
        </div>
        <div className="bg-kratos-darker border border-kratos-border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">{uniqueExercises}</div>
          <div className="text-kratos-text-dim text-sm">Exercises Logged</div>
        </div>
      </div>

      {/* ── Volume stat ── */}
      {totalVol > 0 && (
        <div className="bg-kratos-darker border border-kratos-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-kratos-text-dim">Total Volume Lifted</p>
            <p className="text-2xl font-bold mt-0.5">{Math.round(totalVol).toLocaleString()} lbs</p>
          </div>
          <div className="text-4xl">🏋️</div>
        </div>
      )}

      {/* ── Recent Activity ── */}
      <div className="bg-kratos-darker border border-kratos-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Sessions</h2>
          <Link to="/workouts" className="text-kratos-blue text-sm hover:underline">
            View all →
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-kratos-text-dim mb-4">No sessions logged yet.</p>
            <Link
              to="/workouts"
              className="inline-block bg-kratos-blue-dark hover:bg-kratos-blue-darker text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Log Your First Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {recentLogs.map((log, i) => {
              const badge = TYPE_COLOR[log.type] ?? TYPE_COLOR.Other;
              const vol = log.exercises.reduce((sum, ex) =>
                sum + ex.sets.reduce((s, set) => {
                  const w = set.unit === 'kg' ? set.weight * 2.205 : set.weight;
                  return s + w * set.reps;
                }, 0), 0);
              return (
                <div
                  key={log.id}
                  className={`flex items-center justify-between py-3.5 ${i < recentLogs.length - 1 ? 'border-b border-kratos-border' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${badge} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {log.type.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{log.planName ?? `${log.type} Day`}</div>
                      <div className="text-sm text-kratos-text-dim">
                        {formatDate(log.date)}
                        {vol > 0 && ` · ${Math.round(vol).toLocaleString()} lbs`}
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/workouts"
                    className="text-kratos-blue hover:underline text-sm transition-colors"
                  >
                    View →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
