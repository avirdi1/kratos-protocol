export type DayType = 'Push' | 'Pull' | 'Legs' | 'Other';
export type WeightUnit = 'lbs' | 'kg';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  category: DayType | 'Other';
  equipment?: string;
}

export interface PlanExercise {
  exercise: Exercise;
  sets: number;
  targetReps: number;
  restSeconds: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  type: DayType;
  estimatedMinutes: number;
  description: string;
  scheduledDay: string; // e.g., "Monday"
  exercises: PlanExercise[];
}

export interface LoggedSet {
  reps: number;
  weight: number;
  unit: WeightUnit;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  type: DayType;
  planId?: string;
  planName?: string;
  exercises: LoggedExercise[];
  notes?: string;
}
