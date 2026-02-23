import type { Exercise, WorkoutPlan } from './types';

// ─── Exercise Database ───────────────────────────────────────────────────────

export const EXERCISES: (Exercise & { equipment?: string })[] = [
  // ── PUSH — Chest ────────────────────────────────────────────────────────
  { id: 'bench-press',          name: 'Barbell Bench Press',        muscleGroup: 'Chest',     category: 'Push', equipment: 'Barbell'   },
  { id: 'incline-bench-press',  name: 'Incline Barbell Press',      muscleGroup: 'Chest',     category: 'Push', equipment: 'Barbell'   },
  { id: 'db-bench-press',       name: 'Dumbbell Bench Press',       muscleGroup: 'Chest',     category: 'Push', equipment: 'Dumbbell'  },
  { id: 'incline-db-press',     name: 'Incline Dumbbell Press',     muscleGroup: 'Chest',     category: 'Push', equipment: 'Dumbbell'  },
  { id: 'decline-db-press',     name: 'Decline Dumbbell Press',     muscleGroup: 'Chest',     category: 'Push', equipment: 'Dumbbell'  },
  { id: 'db-fly',               name: 'Dumbbell Fly',               muscleGroup: 'Chest',     category: 'Push', equipment: 'Dumbbell'  },
  { id: 'cable-fly',            name: 'Cable Fly',                  muscleGroup: 'Chest',     category: 'Push', equipment: 'Cable'     },
  { id: 'cable-crossover',      name: 'Cable Crossover',            muscleGroup: 'Chest',     category: 'Push', equipment: 'Cable'     },
  { id: 'chest-press-machine',  name: 'Chest Press Machine',        muscleGroup: 'Chest',     category: 'Push', equipment: 'Machine'   },
  { id: 'pec-deck',             name: 'Pec Deck / Fly Machine',     muscleGroup: 'Chest',     category: 'Push', equipment: 'Machine'   },
  { id: 'push-up',              name: 'Push-Up',                    muscleGroup: 'Chest',     category: 'Push', equipment: 'Bodyweight'},
  { id: 'dip',                  name: 'Chest Dip',                  muscleGroup: 'Chest',     category: 'Push', equipment: 'Bodyweight'},
  { id: 'smith-bench',          name: 'Smith Machine Bench Press',  muscleGroup: 'Chest',     category: 'Push', equipment: 'Machine'   },

  // ── PUSH — Shoulders ─────────────────────────────────────────────────────
  { id: 'ohp',                  name: 'Overhead Press (Barbell)',   muscleGroup: 'Shoulders', category: 'Push', equipment: 'Barbell'   },
  { id: 'db-shoulder-press',    name: 'Dumbbell Shoulder Press',    muscleGroup: 'Shoulders', category: 'Push', equipment: 'Dumbbell'  },
  { id: 'arnold-press',         name: 'Arnold Press',               muscleGroup: 'Shoulders', category: 'Push', equipment: 'Dumbbell'  },
  { id: 'lateral-raise',        name: 'Dumbbell Lateral Raise',     muscleGroup: 'Shoulders', category: 'Push', equipment: 'Dumbbell'  },
  { id: 'cable-lateral-raise',  name: 'Cable Lateral Raise',        muscleGroup: 'Shoulders', category: 'Push', equipment: 'Cable'     },
  { id: 'front-raise',          name: 'Dumbbell Front Raise',       muscleGroup: 'Shoulders', category: 'Push', equipment: 'Dumbbell'  },
  { id: 'shoulder-press-machine','name': 'Shoulder Press Machine',  muscleGroup: 'Shoulders', category: 'Push', equipment: 'Machine'   },
  { id: 'upright-row',          name: 'Upright Row',                muscleGroup: 'Shoulders', category: 'Push', equipment: 'Barbell'   },

  // ── PUSH — Triceps ────────────────────────────────────────────────────────
  { id: 'tricep-pushdown',      name: 'Tricep Rope Pushdown',       muscleGroup: 'Triceps',   category: 'Push', equipment: 'Cable'     },
  { id: 'tricep-bar-pushdown',  name: 'Tricep Bar Pushdown',        muscleGroup: 'Triceps',   category: 'Push', equipment: 'Cable'     },
  { id: 'skull-crusher',        name: 'Skull Crusher (EZ Bar)',     muscleGroup: 'Triceps',   category: 'Push', equipment: 'Barbell'   },
  { id: 'db-skull-crusher',     name: 'Dumbbell Skull Crusher',     muscleGroup: 'Triceps',   category: 'Push', equipment: 'Dumbbell'  },
  { id: 'overhead-tricep-ext',  name: 'Overhead Tricep Extension',  muscleGroup: 'Triceps',   category: 'Push', equipment: 'Dumbbell'  },
  { id: 'cable-overhead-tricep','name': 'Cable Overhead Tricep Ext',muscleGroup: 'Triceps',   category: 'Push', equipment: 'Cable'     },
  { id: 'tricep-dip',           name: 'Tricep Dip',                 muscleGroup: 'Triceps',   category: 'Push', equipment: 'Bodyweight'},
  { id: 'tricep-machine',       name: 'Tricep Extension Machine',   muscleGroup: 'Triceps',   category: 'Push', equipment: 'Machine'   },
  { id: 'db-kickback',          name: 'Dumbbell Kickback',          muscleGroup: 'Triceps',   category: 'Push', equipment: 'Dumbbell'  },
  { id: 'close-grip-bench',     name: 'Close Grip Bench Press',     muscleGroup: 'Triceps',   category: 'Push', equipment: 'Barbell'   },

  // ── PULL — Back ──────────────────────────────────────────────────────────
  { id: 'barbell-row',          name: 'Barbell Row',                muscleGroup: 'Back',      category: 'Pull', equipment: 'Barbell'   },
  { id: 'deadlift',             name: 'Deadlift',                   muscleGroup: 'Back',      category: 'Pull', equipment: 'Barbell'   },
  { id: 'lat-pulldown',         name: 'Lat Pulldown',               muscleGroup: 'Lats',      category: 'Pull', equipment: 'Cable'     },
  { id: 'wide-pulldown',        name: 'Wide-Grip Lat Pulldown',     muscleGroup: 'Lats',      category: 'Pull', equipment: 'Cable'     },
  { id: 'seated-cable-row',     name: 'Seated Cable Row',           muscleGroup: 'Back',      category: 'Pull', equipment: 'Cable'     },
  { id: 'pull-up',              name: 'Pull-Up',                    muscleGroup: 'Lats',      category: 'Pull', equipment: 'Bodyweight'},
  { id: 'chin-up',              name: 'Chin-Up',                    muscleGroup: 'Lats',      category: 'Pull', equipment: 'Bodyweight'},
  { id: 'assisted-pullup',      name: 'Assisted Pull-Up Machine',   muscleGroup: 'Lats',      category: 'Pull', equipment: 'Machine'   },
  { id: 'db-row',               name: 'Dumbbell Row',               muscleGroup: 'Back',      category: 'Pull', equipment: 'Dumbbell'  },
  { id: 'chest-supported-row',  name: 'Chest Supported Row',        muscleGroup: 'Back',      category: 'Pull', equipment: 'Machine'   },
  { id: 'machine-row',          name: 'Seated Row Machine',         muscleGroup: 'Back',      category: 'Pull', equipment: 'Machine'   },
  { id: 't-bar-row',            name: 'T-Bar Row',                  muscleGroup: 'Back',      category: 'Pull', equipment: 'Barbell'   },
  { id: 'face-pull',            name: 'Face Pull',                  muscleGroup: 'Rear Delt', category: 'Pull', equipment: 'Cable'     },
  { id: 'db-shrug',             name: 'Dumbbell Shrug',             muscleGroup: 'Traps',     category: 'Pull', equipment: 'Dumbbell'  },
  { id: 'barbell-shrug',        name: 'Barbell Shrug',              muscleGroup: 'Traps',     category: 'Pull', equipment: 'Barbell'   },

  // ── PULL — Biceps ─────────────────────────────────────────────────────────
  { id: 'db-curl',              name: 'Dumbbell Bicep Curl',        muscleGroup: 'Biceps',    category: 'Pull', equipment: 'Dumbbell'  },
  { id: 'barbell-curl',         name: 'Barbell Curl',               muscleGroup: 'Biceps',    category: 'Pull', equipment: 'Barbell'   },
  { id: 'ez-bar-curl',          name: 'EZ Bar Curl',                muscleGroup: 'Biceps',    category: 'Pull', equipment: 'Barbell'   },
  { id: 'hammer-curl',          name: 'Hammer Curl',                muscleGroup: 'Biceps',    category: 'Pull', equipment: 'Dumbbell'  },
  { id: 'incline-db-curl',      name: 'Incline Dumbbell Curl',      muscleGroup: 'Biceps',    category: 'Pull', equipment: 'Dumbbell'  },
  { id: 'cable-curl',           name: 'Cable Curl',                 muscleGroup: 'Biceps',    category: 'Pull', equipment: 'Cable'     },
  { id: 'preacher-curl',        name: 'Preacher Curl',              muscleGroup: 'Biceps',    category: 'Pull', equipment: 'Machine'   },
  { id: 'concentration-curl',   name: 'Concentration Curl',         muscleGroup: 'Biceps',    category: 'Pull', equipment: 'Dumbbell'  },

  // ── LEGS — Quads ──────────────────────────────────────────────────────────
  { id: 'squat',                name: 'Barbell Squat',              muscleGroup: 'Quads',     category: 'Legs', equipment: 'Barbell'   },
  { id: 'front-squat',          name: 'Front Squat',                muscleGroup: 'Quads',     category: 'Legs', equipment: 'Barbell'   },
  { id: 'smith-squat',          name: 'Smith Machine Squat',        muscleGroup: 'Quads',     category: 'Legs', equipment: 'Machine'   },
  { id: 'hack-squat',           name: 'Hack Squat',                 muscleGroup: 'Quads',     category: 'Legs', equipment: 'Machine'   },
  { id: 'leg-press',            name: 'Leg Press',                  muscleGroup: 'Quads',     category: 'Legs', equipment: 'Machine'   },
  { id: 'leg-extension',        name: 'Leg Extension',              muscleGroup: 'Quads',     category: 'Legs', equipment: 'Machine'   },
  { id: 'walking-lunge',        name: 'Walking Lunges',             muscleGroup: 'Quads',     category: 'Legs', equipment: 'Bodyweight'},
  { id: 'db-lunge',             name: 'Dumbbell Lunge',             muscleGroup: 'Quads',     category: 'Legs', equipment: 'Dumbbell'  },
  { id: 'db-goblet-squat',      name: 'Goblet Squat',               muscleGroup: 'Quads',     category: 'Legs', equipment: 'Dumbbell'  },
  { id: 'bulgarian-split-squat','name': 'Bulgarian Split Squat',    muscleGroup: 'Quads',     category: 'Legs', equipment: 'Dumbbell'  },
  { id: 'step-up',              name: 'Step-Up',                    muscleGroup: 'Quads',     category: 'Legs', equipment: 'Dumbbell'  },

  // ── LEGS — Hamstrings / Glutes ────────────────────────────────────────────
  { id: 'rdl',                  name: 'Romanian Deadlift (Barbell)',muscleGroup: 'Hamstrings', category: 'Legs', equipment: 'Barbell'   },
  { id: 'db-rdl',               name: 'Romanian Deadlift (Dumbbell)',muscleGroup: 'Hamstrings',category: 'Legs', equipment: 'Dumbbell' },
  { id: 'leg-curl',             name: 'Lying Leg Curl',             muscleGroup: 'Hamstrings', category: 'Legs', equipment: 'Machine'  },
  { id: 'seated-leg-curl',      name: 'Seated Leg Curl',            muscleGroup: 'Hamstrings', category: 'Legs', equipment: 'Machine'  },
  { id: 'nordic-curl',          name: 'Nordic Hamstring Curl',      muscleGroup: 'Hamstrings', category: 'Legs', equipment: 'Bodyweight'},
  { id: 'hip-thrust',           name: 'Hip Thrust (Barbell)',       muscleGroup: 'Glutes',    category: 'Legs', equipment: 'Barbell'   },
  { id: 'db-hip-thrust',        name: 'Hip Thrust (Dumbbell)',      muscleGroup: 'Glutes',    category: 'Legs', equipment: 'Dumbbell'  },
  { id: 'glute-bridge',         name: 'Glute Bridge',               muscleGroup: 'Glutes',    category: 'Legs', equipment: 'Bodyweight'},
  { id: 'cable-kickback',       name: 'Cable Glute Kickback',       muscleGroup: 'Glutes',    category: 'Legs', equipment: 'Cable'     },
  { id: 'abductor-machine',     name: 'Abductor Machine',           muscleGroup: 'Glutes',    category: 'Legs', equipment: 'Machine'   },
  { id: 'adductor-machine',     name: 'Adductor Machine',           muscleGroup: 'Inner Thigh',category: 'Legs',equipment: 'Machine'   },

  // ── LEGS — Calves ─────────────────────────────────────────────────────────
  { id: 'calf-raise',           name: 'Standing Calf Raise',        muscleGroup: 'Calves',    category: 'Legs', equipment: 'Machine'   },
  { id: 'seated-calf-raise',    name: 'Seated Calf Raise',          muscleGroup: 'Calves',    category: 'Legs', equipment: 'Machine'   },
  { id: 'db-calf-raise',        name: 'Dumbbell Calf Raise',        muscleGroup: 'Calves',    category: 'Legs', equipment: 'Dumbbell'  },

  // ── OTHER / CORE / FULL BODY ───────────────────────────────────────────────
  { id: 'plank',                name: 'Plank',                      muscleGroup: 'Core',      category: 'Other', equipment: 'Bodyweight'},
  { id: 'ab-wheel',             name: 'Ab Wheel Rollout',           muscleGroup: 'Core',      category: 'Other', equipment: 'Other'    },
  { id: 'cable-crunch',         name: 'Cable Crunch',               muscleGroup: 'Core',      category: 'Other', equipment: 'Cable'    },
  { id: 'hanging-leg-raise',    name: 'Hanging Leg Raise',          muscleGroup: 'Core',      category: 'Other', equipment: 'Bodyweight'},
  { id: 'crunch',               name: 'Crunch',                     muscleGroup: 'Core',      category: 'Other', equipment: 'Bodyweight'},
  { id: 'russian-twist',        name: 'Russian Twist',              muscleGroup: 'Core',      category: 'Other', equipment: 'Bodyweight'},
  { id: 'farmers-carry',        name: "Farmer's Carry",             muscleGroup: 'Full Body', category: 'Other', equipment: 'Dumbbell' },
  { id: 'battle-ropes',         name: 'Battle Ropes',               muscleGroup: 'Full Body', category: 'Other', equipment: 'Other'    },
  { id: 'box-jump',             name: 'Box Jump',                   muscleGroup: 'Full Body', category: 'Other', equipment: 'Bodyweight'},
  { id: 'clean',                name: 'Power Clean',                muscleGroup: 'Full Body', category: 'Other', equipment: 'Barbell'  },
];

export function getExercisesByCategory(category: string): (Exercise & { equipment?: string })[] {
  if (category === 'Other') return EXERCISES;
  return EXERCISES.filter(e => e.category === category || e.category === 'Other');
}

// ─── Beginner PPL Plan ───────────────────────────────────────────────────────

const bench    = EXERCISES.find(e => e.id === 'bench-press')!;
const ohp      = EXERCISES.find(e => e.id === 'ohp')!;
const tricep   = EXERCISES.find(e => e.id === 'tricep-pushdown')!;
const row      = EXERCISES.find(e => e.id === 'barbell-row')!;
const lat      = EXERCISES.find(e => e.id === 'lat-pulldown')!;
const curl     = EXERCISES.find(e => e.id === 'db-curl')!;
const squat    = EXERCISES.find(e => e.id === 'squat')!;
const rdl      = EXERCISES.find(e => e.id === 'rdl')!;
const legpress = EXERCISES.find(e => e.id === 'leg-press')!;

export const BEGINNER_PPL: WorkoutPlan[] = [
  {
    id: 'beginner-push',
    name: 'Push Day A',
    type: 'Push',
    estimatedMinutes: 55,
    scheduledDay: 'Monday',
    description: 'Chest, shoulders & triceps. Focus on form over weight — keep your back flat on the bench and drive through the full range of motion.',
    exercises: [
      { exercise: bench,  sets: 3, targetReps: 8,  restSeconds: 120 },
      { exercise: ohp,    sets: 3, targetReps: 8,  restSeconds: 120 },
      { exercise: tricep, sets: 3, targetReps: 12, restSeconds: 90  },
    ],
  },
  {
    id: 'beginner-pull',
    name: 'Pull Day B',
    type: 'Pull',
    estimatedMinutes: 50,
    scheduledDay: 'Wednesday',
    description: 'Back & biceps. Initiate every pull with your lats, not your arms. Keep your core braced during barbell rows.',
    exercises: [
      { exercise: row,  sets: 3, targetReps: 8,  restSeconds: 120 },
      { exercise: lat,  sets: 3, targetReps: 10, restSeconds: 90  },
      { exercise: curl, sets: 3, targetReps: 12, restSeconds: 60  },
    ],
  },
  {
    id: 'beginner-legs',
    name: 'Legs Day C',
    type: 'Legs',
    estimatedMinutes: 60,
    scheduledDay: 'Friday',
    description: 'Quads, hamstrings & glutes. Squat to parallel or below. Take the extra rest — your CNS needs it on heavy leg days.',
    exercises: [
      { exercise: squat,    sets: 3, targetReps: 8,  restSeconds: 150 },
      { exercise: rdl,      sets: 3, targetReps: 10, restSeconds: 120 },
      { exercise: legpress, sets: 3, targetReps: 12, restSeconds: 90  },
    ],
  },
];
