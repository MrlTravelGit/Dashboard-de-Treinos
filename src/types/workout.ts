export interface WorkoutSession {
  id: string;
  date: string;
  duration: number; // in seconds
  isManual: boolean;
  justification?: string;
  createdAt: string;
}

export type SheetType = 'A' | 'B' | 'C' | 'D' | 'E';

export interface DayWorkout {
  date: string; // YYYY-MM-DD
  workoutType: SheetType | 'rest';
  completed: boolean;
  duration: number; // in seconds
  sessions: WorkoutSession[];
  completedExercises?: string[]; // IDs of completed exercises
}

export interface WeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: DayWorkout[];
  isCurrent: boolean;
}

export interface MonthlyStats {
  month: number;
  name: string;
  completed: number;
  percentage: number;
}

export interface WorkoutStats {
  completed: number;
  progress: number;
  totalHours: number;
  totalMinutes: number;
  currentWeek: number;
  annualGoal: number;
  remaining: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number; // in kg
}

export interface WorkoutSheet {
  type: SheetType;
  name: string;
  exercises: Exercise[];
}
