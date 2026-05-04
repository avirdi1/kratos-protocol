import { useState, useRef, useEffect } from 'react';
import { useWorkoutLog } from '../hooks/useWorkoutLog';
import { useChatSessions } from '../hooks/useChatSessions';
import type { ChatMessage } from '../hooks/useChatSessions';
import type { WorkoutLog } from '../data/types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

function buildWorkoutContext(logs: WorkoutLog[]): string {
  if (logs.length === 0) return 'The user has no workout history logged yet.';

  const byType: Record<string, WorkoutLog[]> = {};
  for (const log of logs) {
    if (!byType[log.type]) byType[log.type] = [];
    if (byType[log.type].length < 3) byType[log.type].push(log);
  }

  const lines: string[] = ['WORKOUT HISTORY (most recent sessions per type):'];
  for (const [type, sessions] of Object.entries(byType)) {
    lines.push(`\n${type.toUpperCase()} DAYS:`);
    for (const log of sessions) {
      lines.push(`  Session on ${log.date}:`);
      for (const ex of log.exercises) {
        const sets = ex.sets.map(s => `${s.weight}${s.unit}×${s.reps}`).join(', ');
        lines.push(`    - ${ex.exerciseName}: ${sets}`);
      }
      if (log.notes) lines.push(`    Notes: ${log.notes}`);
    }
  }
  return lines.join('\n');
}

function buildSystemInstruction(logs: WorkoutLog[]): string {
  const context = buildWorkoutContext(logs);
  return `You are Atlas, the built-in strength coach for Kratos Protocol — a workout tracking app for lifters following a Push/Pull/Legs (PPL) split. You are direct, knowledgeable, and data-driven. You do not waste words.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE & PHILOSOPHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You coach intermediate-to-beginner lifters on strength training. Your job is to help them progress safely and consistently. You believe in:
- Progressive overload as the foundation of all strength gains
- Consistency over intensity — showing up beats heroic effort
- Recovery (sleep, food, rest days) as part of the program, not optional
- Simplicity: most people need to do less, not more

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU HAVE ACCESS TO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have the user's full workout history injected below. Use it. Do not say "I don't have access to your data" — you do. Reference exact exercises, weights, reps, and dates when relevant. If the history is empty, say so clearly and help them get started.

${context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO USE THE DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Compare sessions across the same workout type (Push vs Push, Pull vs Pull) to spot trends
- Identify stalls: same weight/reps across 2+ sessions of the same type = plateau
- Identify regressions: weight or reps dropped compared to the previous same-type session
- Identify wins: weight or reps improved — acknowledge these specifically
- Do NOT invent data or make up numbers that aren't in the history
- If the data is ambiguous or sparse, say so and ask a clarifying question

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROGRESSION PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When recommending weight increases:
- Upper body compounds (bench, overhead press, rows): +2.5–5 lbs per session when all sets are completed cleanly
- Lower body compounds (squat, deadlift, leg press): +5–10 lbs per session when all sets are completed cleanly
- Isolation exercises (curls, tricep pushdowns, lateral raises): +2.5 lbs or +1 rep — only when form is solid
- If a user fails to complete their target reps, do NOT suggest increasing weight — suggest repeating the same weight or reducing by 5–10%
- Never suggest jumping more than 10 lbs at once unless the user is clearly under-loading

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GUARD RAILS — WHAT YOU WILL NOT DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. NO medical advice. If a user describes pain (joint pain, sharp pain, numbness, injury), tell them to stop the exercise and see a doctor or physiotherapist. Do not diagnose, do not say "it's probably just DOMS."
2. NO extreme diet advice. Do not recommend very low calorie diets, extreme cuts, or specific supplement stacks. General guidance (protein intake ~0.7–1g per lb bodyweight, eat enough to support training) is fine. Anything beyond that: refer them to a registered dietitian.
3. NO made-up data. Never fabricate workout numbers. If their history doesn't contain what you need to answer, say so.
4. NO off-topic conversations. If the user asks about something unrelated to fitness, training, recovery, or nutrition — politely redirect. You are a fitness coach, not a general assistant.
5. NO dangerous advice. Do not recommend 1-rep max attempts for beginners. Do not recommend skipping rest days when the user shows signs of overtraining. Do not recommend training through pain.
6. NO empty motivation. Do not just say "you got this!" or "keep pushing!" without substance. Every motivational statement must be paired with a concrete next action.
7. NO repetitive lecturing. If you've already warned the user about something (e.g., rest days, form), don't repeat that exact warning in the same conversation unless they've ignored it and it's a safety issue.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Keep replies concise. Most answers should be 3–8 sentences. Use bullet points or numbered lists only when comparing options or laying out a plan.
- Lead with the answer, then the reasoning. Don't bury the recommendation.
- When prescribing a next session, be specific: name the exercise, the weight, the sets, and the reps. Example: "Next Push day: Bench Press 4×6 @ 145 lbs, then Overhead Press 3×8 @ 85 lbs."
- Use plain language. No jargon without a brief explanation.
- Do not use excessive emojis. One per response max, and only if it genuinely fits.
- Do not start your reply with "Great question!" or "Absolutely!" or any filler affirmation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HANDLING COMMON SITUATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Plateau: Ask how many sessions they've stalled. If 2+, suggest a deload week (50–60% of normal weight, same volume) before attempting to push past it.
Fatigue/overtraining signs: Ask about sleep hours and days since last rest day. If sleep <7h or no rest day in 7+ days, prescribe rest before more training.
Skipped sessions: Don't shame. Ask what got in the way, and help them build a realistic schedule going forward.
Beginner with no logs: Start with the basics — ask their current fitness level, available equipment, and days per week. Recommend the Beginner PPL plan in the app.
User wants to change programs: Understand why first. If they're bored after 2 weeks, explain that consistency beats novelty. If they've run PPL for 6+ months and stalled, discuss options.`;
}

async function sendMessage(
  userText: string,
  history: ChatMessage[],
  systemInstruction: string
): Promise<string> {
  const contents: GeminiContent[] = [
    ...history.map(msg => ({
      role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: msg.text }],
    })),
    { role: 'user' as const, parts: [{ text: userText }] },
  ];

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `Gemini API error ${res.status}`);
  }

  const data = await res.json() as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response received.';
}

const SUGGESTED_PROMPTS = [
  "What should I do for my next Push day?",
  "Am I making progress on my lifts?",
  "What should I eat before a Legs session?",
  "I've been feeling fatigued — should I deload?",
];

function formatSessionDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now.getTime() - 86400000);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AICoach() {
  const { logs } = useWorkoutLog();
  const { sessions, activeId, createSession, selectSession, saveMessages, deleteSession } = useChatSessions();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialLoadDoneRef = useRef(false);

  const systemInstruction = buildSystemInstruction(logs);

  // Load most recent session's messages on initial page load
  useEffect(() => {
    if (!initialLoadDoneRef.current && activeId && sessions.length > 0) {
      initialLoadDoneRef.current = true;
      const session = sessions.find(s => s.id === activeId);
      if (session) setMessages(session.messages);
    }
  }, [activeId, sessions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function handleSelectSession(id: string) {
    const session = sessions.find(s => s.id === id);
    setMessages(session?.messages ?? []);
    selectSession(id);
    setSidebarOpen(false);
    setError('');
    setInput('');
  }

  async function handleNewChat() {
    initialLoadDoneRef.current = true;
    await createSession();
    setMessages([]);
    setInput('');
    setError('');
    setSidebarOpen(false);
  }

  async function handleDeleteSession(id: string) {
    if (id === activeId) {
      setMessages([]);
      setError('');
      setInput('');
    }
    await deleteSession(id);
  }

  async function handleSend(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    let sessionId = activeId;
    if (!sessionId) {
      initialLoadDoneRef.current = true;
      sessionId = await createSession();
      if (!sessionId) return;
    }

    const userMsg: ChatMessage = { role: 'user', text: userText };
    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    setInput('');
    setError('');
    setLoading(true);

    const isFirstMessage = messages.length === 0;
    const title = isFirstMessage ? userText.slice(0, 50) : undefined;

    try {
      const reply = await sendMessage(userText, messages, systemInstruction);
      const finalMessages = [...updatedWithUser, { role: 'coach' as const, text: reply }];
      setMessages(finalMessages);
      await saveMessages(sessionId, finalMessages, title);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)]">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 shrink-0 flex-col bg-kratos-darker border border-kratos-border rounded-lg`}>
        <div className="p-3 border-b border-kratos-border">
          <button
            onClick={handleNewChat}
            className="w-full px-3 py-2 border border-kratos-border text-kratos-text hover:border-kratos-blue hover:text-kratos-blue text-sm font-semibold rounded-lg transition-colors"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 && (
            <p className="text-xs text-kratos-text-dim text-center p-4">No chats yet</p>
          )}
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={`group flex items-center gap-2 px-3 py-3 cursor-pointer transition-colors border-b border-kratos-border/50 ${
                activeId === session.id
                  ? 'bg-kratos-dark/60 border-l-2 border-l-kratos-blue'
                  : 'hover:bg-kratos-dark/40'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-kratos-text truncate">{session.title}</p>
                <p className="text-xs text-kratos-text-dim">{formatSessionDate(session.updated_at)}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleDeleteSession(session.id); }}
                className="opacity-0 group-hover:opacity-100 text-kratos-text-dim hover:text-red-400 transition-all text-xs p-1 rounded shrink-0"
                title="Delete chat"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          className="md:hidden p-3 text-sm text-kratos-text-dim hover:text-kratos-text border-t border-kratos-border transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          ← Back to chat
        </button>
      </aside>

      {/* Chat area */}
      <div className={`${sidebarOpen ? 'hidden' : 'flex'} md:flex flex-1 flex-col min-w-0 md:pl-6`}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            className="md:hidden p-2 text-kratos-text-dim hover:text-kratos-text transition-colors rounded-lg border border-kratos-border"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div>
            <h1 className="text-2xl font-bold text-kratos-text">Atlas</h1>
            <p className="text-kratos-text-dim text-sm mt-1">Your coach knows your full workout history. Ask anything.</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 && (
            <div className="space-y-4 pt-4">
              <p className="text-center text-kratos-text-dim text-sm">
                {logs.length === 0
                  ? 'No workouts logged yet — ask the coach where to start.'
                  : `Coach has access to your ${logs.length} logged session${logs.length !== 1 ? 's' : ''}.`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {SUGGESTED_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-left px-4 py-3 bg-kratos-darker border border-kratos-border rounded-xl text-sm text-kratos-text-dim hover:text-kratos-text hover:border-kratos-blue transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-kratos-darker border border-kratos-border text-kratos-text rounded-bl-sm'
                }`}
              >
                {msg.role === 'coach' && (
                  <p className="text-xs text-kratos-text-dim font-semibold mb-1 uppercase tracking-wide">Atlas</p>
                )}
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-kratos-darker border border-kratos-border px-4 py-3 rounded-2xl rounded-bl-sm">
                <p className="text-xs text-kratos-text-dim font-semibold mb-1 uppercase tracking-wide">Coach</p>
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 bg-kratos-text-dim rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-kratos-text-dim rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-kratos-text-dim rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="mt-4 flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach anything..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-kratos-darker border border-kratos-border text-kratos-text placeholder-kratos-text-dim rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-kratos-blue transition-colors disabled:opacity-50"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-kratos-text-dim text-center mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
