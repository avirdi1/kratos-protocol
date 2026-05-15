import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useWorkoutLog } from '../hooks/useWorkoutLog';
import LogWorkoutModal from '../components/LogWorkoutModal';

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}


const TYPE_STYLE: Record<string, string> = {
  Push:  'bg-blue-600',
  Pull:  'bg-green-600',
  Legs:  'bg-purple-600',
  Other: 'bg-slate-600',
};

// PPL schedule for "This Week" section
const WEEKLY_SCHEDULE = [
  { day: 'Mon', type: 'Push', muscles: 'Chest · Shoulders · Triceps' },
  { day: 'Tue', type: null,   muscles: 'Rest' },
  { day: 'Wed', type: 'Pull', muscles: 'Back · Biceps' },
  { day: 'Thu', type: null,   muscles: 'Rest' },
  { day: 'Fri', type: 'Legs', muscles: 'Quads · Hamstrings · Glutes' },
  { day: 'Sat', type: null,   muscles: 'Rest' },
  { day: 'Sun', type: null,   muscles: 'Rest' },
];

export default function Home() {
  const { logs, addLog, getThisWeekLogs, getStreak, getTotalVolume, loggedDates } = useWorkoutLog();
  const [modalOpen, setModalOpen] = useState(false);

  const thisWeek = getThisWeekLogs();
  const streak = getStreak();
  const totalVol = getTotalVolume();
  const recentLogs = logs.slice(0, 3);

  // Volume per session — last 10 sessions in chronological order
  const volumePerSession = logs.slice(0, 10).reverse().map(log => {
    const vol = log.exercises.reduce((t, ex) =>
      t + ex.sets.reduce((s, set) => {
        const w = set.unit === 'kg' ? set.weight * 2.205 : set.weight;
        return s + w * set.reps;
      }, 0), 0);
    return {
      date: new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      volume: Math.round(vol),
    };
  });

  // Determine which days this week have been logged
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDates = dayNames.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  // Workouts per week — last 8 weeks
  const weeklyWorkouts = Array.from({ length: 8 }, (_, i) => {
    const mon = new Date(monday);
    mon.setDate(monday.getDate() - (7 - i) * 7);
    const key = mon.toISOString().slice(0, 10);
    const label = mon.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    return { label, workouts: logs.filter(l => getWeekKey(l.date) === key).length };
  });

  return (
    <div className="space-y-12">

      {/* ── Hero ── */}
      <div className="text-center py-10">
        <h1 className="text-5xl font-bold mb-3">
          <span className="text-kratos-blue">Kratos</span> Protocol
        </h1>
        <p className="text-xl text-kratos-text-dim mb-8 max-w-xl mx-auto">
          Build strength. Stay consistent. Track every rep.
        </p>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-kratos-blue-dark hover:bg-kratos-blue-darker text-white font-semibold px-10 py-3 rounded-lg transition-colors text-lg w-56"
          >
            + Log Workout
          </button>
          <Link
            to="/workouts"
            className="text-kratos-text-dim hover:text-kratos-blue text-sm transition-colors underline underline-offset-4"
          >
            View Plan →
          </Link>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-kratos-darker border border-kratos-border rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-kratos-blue">{thisWeek.length}</div>
          <div className="text-kratos-text-dim text-sm mt-1">Workouts This Week</div>
        </div>
        <div className="bg-kratos-darker border border-kratos-border rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-orange-400">{streak}</div>
          <div className="text-kratos-text-dim text-sm mt-1">
            Day Streak {streak > 0 ? '🔥' : ''}
          </div>
        </div>
        <div className="bg-kratos-darker border border-kratos-border rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-green-400">
            {totalVol > 0 ? `${(totalVol / 1000).toFixed(1)}k` : '0'}
          </div>
          <div className="text-kratos-text-dim text-sm mt-1">Total lbs Lifted</div>
        </div>
      </div>

      {/* ── This Week's Schedule ── */}
      <section>
        <h2 className="text-lg font-semibold mb-4">This Week's Schedule</h2>
        <div className="grid grid-cols-7 gap-2">
          {WEEKLY_SCHEDULE.map((s, i) => {
            const iso = weekDates[i];
            const logged = loggedDates.has(iso);
            const isToday = iso === now.toISOString().slice(0, 10);
            return (
              <div
                key={s.day}
                className={`
                  bg-kratos-darker border rounded-xl p-3 flex flex-col items-center gap-2 text-center
                  ${isToday ? 'border-kratos-blue' : 'border-kratos-border'}
                `}
              >
                <span className={`text-xs font-semibold ${isToday ? 'text-kratos-blue' : 'text-kratos-text-dim'}`}>
                  {s.day}
                </span>
                {s.type ? (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${TYPE_STYLE[s.type]} ${logged ? 'opacity-100' : 'opacity-50'}`}>
                    {logged ? '✓ ' : ''}{s.type}
                  </span>
                ) : (
                  <span className="text-kratos-text-dim text-xs">Rest</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Progress Charts ── */}
      {logs.length > 1 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Progress</h2>
          <div className="grid md:grid-cols-2 gap-4">

            <div className="bg-kratos-darker border border-kratos-border rounded-xl p-5">
              <p className="text-sm font-semibold text-kratos-text-dim mb-4">Volume per Session (lbs)</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={volumePerSession} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                    itemStyle={{ color: '#60a5fa', fontWeight: 600 }}
                    formatter={(value) => [`${Number(value).toLocaleString()} lbs`, '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={{ fill: '#60a5fa', r: 3 }}
                    activeDot={{ r: 5, fill: '#60a5fa' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-kratos-darker border border-kratos-border rounded-xl p-5">
              <p className="text-sm font-semibold text-kratos-text-dim mb-4">Workouts per Week</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyWorkouts} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                    itemStyle={{ color: '#60a5fa', fontWeight: 600 }}
                    formatter={(value) => [`${Number(value)} workout${Number(value) !== 1 ? 's' : ''}`, '']}
                    labelFormatter={(label) => `Week of ${label}`}
                  />
                  <Bar dataKey="workouts" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </section>
      )}

      {/* ── Recent Sessions ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>
          {logs.length > 3 && (
            <Link to="/workouts" className="text-kratos-blue text-sm hover:underline">
              View all →
            </Link>
          )}
        </div>

        {recentLogs.length === 0 ? (
          <div className="bg-kratos-darker border border-kratos-border rounded-xl p-8 text-center">
            <p className="text-kratos-text-dim mb-4">No workouts logged yet. Start your first session!</p>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-kratos-blue-dark hover:bg-kratos-blue-darker text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Log First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map(log => {
              const badge = TYPE_STYLE[log.type] ?? TYPE_STYLE.Other;
              return (
                <div key={log.id} className="bg-kratos-darker border border-kratos-border rounded-xl px-5 py-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${badge} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {log.type.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{log.planName ?? `${log.type} Day`}</p>
                    <p className="text-kratos-text-dim text-sm">
                      {formatDisplayDate(log.date)} · {log.exercises.length} exercise{log.exercises.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Link to="/workouts" className="text-kratos-text-dim hover:text-kratos-blue text-sm transition-colors">
                    Details →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Features ── */}
      <section className="grid md:grid-cols-3 gap-5">
        <div className="bg-kratos-darker border border-kratos-border rounded-xl p-6">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
          <p className="text-kratos-text-dim text-sm">Log every set, rep, and weight. Watch your strength compound over time.</p>
        </div>
        <div className="bg-kratos-darker border border-kratos-border rounded-xl p-6">
          <div className="text-3xl mb-3">💪</div>
          <h3 className="text-lg font-semibold mb-2">Beginner PPL Plan</h3>
          <p className="text-kratos-text-dim text-sm">Science-backed Push / Pull / Legs program. 3 days a week, built for newbies.</p>
        </div>
        <div className="bg-kratos-darker border border-kratos-border rounded-xl p-6">
          <div className="text-3xl mb-3">🔥</div>
          <h3 className="text-lg font-semibold mb-2">Stay Consistent</h3>
          <p className="text-kratos-text-dim text-sm">Streak tracking and weekly schedule to keep you showing up every session.</p>
        </div>
      </section>

      {/* ── Modal ── */}
      {modalOpen && (
        <LogWorkoutModal
          onSave={addLog}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
