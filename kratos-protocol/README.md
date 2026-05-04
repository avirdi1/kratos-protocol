# Kratos Protocol

Strength training tracker with a dark UI. Log Push/Pull/Legs workouts, track your volume over time, and challenge friends to see who had the better session.

---

## What it does

- Log workouts by type (Push/Pull/Legs/Other) with sets, reps, and weight
- Follows a Beginner PPL split — or build your own plan
- Tracks your streak, weekly volume, and full session history
- **Challenges** — send a friend a 6-char code, you both log the same workout, scoring is based on how you did vs your own baseline so weight totals don't matter
- AI Coach page (in progress)

---

## Stack

- React 18 + TypeScript
- Tailwind CSS 4.1.18
- React Router v7
- Vite
- Supabase (auth + database)

---

## Running locally

You need Node 18+ and a Supabase project.

```bash
npm install          # install dependencies
npm run dev          # start dev server at localhost:5173
```

Create a `.env` file in the project root with your credentials:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

---

## Build

```bash
npm run build      # production build, outputs to dist/
npm run preview    # preview the production build locally
```
