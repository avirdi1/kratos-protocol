export type Workout = { id: number; title: string; date: string };

const mockWorkouts: Workout[] = [
  { id: 1, title: "Push day", date: "2025-05-01" },
  { id: 2, title: "Pull day", date: "2025-05-03" },
  { id: 3, title: "Legs", date: "2025-05-05" },
];

export default mockWorkouts;
