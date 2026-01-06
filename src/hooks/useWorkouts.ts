import { useEffect, useRef, useState } from "react";
import {
  DayWorkout,
  WeekData,
  WorkoutSession,
  WorkoutStats,
  SheetType,
} from "@/types/workout";
import supabase from "@/lib/supabaseClient";

const ALL_SHEET_TYPES: SheetType[] = ["A", "B", "C", "D", "E"];

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const formatTimeDetailed = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

export const useWorkouts = () => {
  const [loading, setLoading] = useState(true);
  const updateSheetCount = (count: number) => {
  if (loading) return;
  setSheetCount(count);
};
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [restDays, setRestDays] = useState<number[]>([0]);
  const [sheetCount, setSheetCount] = useState(3);
  const [annualGoal, setAnnualGoal] = useState(208);

  const hydratedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setLoading(false);
        return;
      }

      if (hydratedRef.current) return;
      hydratedRef.current = true;

      const { data: workouts } = await supabase
        .from("user_workouts")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (workouts?.weeks) {
        setWeeks(workouts.weeks);
      }

      setLoading(false);
    };

    init();
  }, []);

  const getDayData = (date: string) => {
    for (const week of weeks) {
      const day = week.days.find((d) => d.date === date);
      if (day) return day;
    }
    return undefined;
  };

  const toggleDayExpanded = (date: string) => {
    if (loading) return;
    setExpandedDay((prev) => (prev === date ? null : date));
  };

    const addSession = (
      date: string,
      duration: number,
      isManual: boolean,
      justification?: string
    ) => {
      if (loading) return;

    const newSession: WorkoutSession = {
  id: crypto.randomUUID(),
  date,
  duration,
  isManual,
  justification,
  createdAt: new Date().toISOString(),
};

      

    setWeeks((prev) =>
      prev.map((week) => ({
        ...week,
        days: week.days.map((day) => {
          if (day.date !== date) return day;

          const sessions = [...day.sessions, newSession];
          const total = sessions.reduce((s, v) => s + v.duration, 0);

          return {
            ...day,
            sessions,
            duration: total,
            completed: total > 0,
          };
        }),
      }))
    );
  };

  const deleteSession = (date: string, sessionId: string) => {
    setWeeks((prev) =>
      prev.map((week) => ({
        ...week,
        days: week.days.map((day) => {
          if (day.date !== date) return day;

          const sessions = day.sessions.filter((s) => s.id !== sessionId);
          const total = sessions.reduce((s, v) => s + v.duration, 0);

          return {
            ...day,
            sessions,
            duration: total,
            completed: total > 0,
          };
        }),
      }))
    );
  };

  const toggleExerciseComplete = (date: string, exerciseId: string) => {
    setWeeks((prev) =>
      prev.map((week) => ({
        ...week,
        days: week.days.map((day) => {
          if (day.date !== date) return day;

          const completed = day.completedExercises ?? [];
          const exists = completed.includes(exerciseId);

          return {
            ...day,
            completedExercises: exists
              ? completed.filter((id) => id !== exerciseId)
              : [...completed, exerciseId],
          };
        }),
      }))
    );
  };

  const getStats = (): WorkoutStats => {
    let completed = 0;
    let seconds = 0;

    weeks.forEach((w) =>
      w.days.forEach((d) => {
        if (d.completed && d.workoutType !== "rest") completed++;
        seconds += d.duration;
      })
    );

    return {
      completed,
      remaining: Math.max(0, annualGoal - completed),
      progress: (completed / annualGoal) * 100,
      totalHours: Math.floor(seconds / 3600),
      totalMinutes: Math.floor((seconds % 3600) / 60),
      currentWeek: weeks.find((w) => w.isCurrent)?.weekNumber ?? 1,
      annualGoal,
    };
  };

  return {
    loading,
    weeks,
    restDays,
    sheetCount,
    annualGoal,
    expandedDay,
    getDayData,
    toggleDayExpanded,
    addSession,
    deleteSession,
    toggleExerciseComplete,
    getStats,
    formatTime,
    formatTimeDetailed,
    updateSheetCount,
  };
};
