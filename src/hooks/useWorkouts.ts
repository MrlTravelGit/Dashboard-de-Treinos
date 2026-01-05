import { useState, useEffect, useCallback } from 'react';
import { DayWorkout, WeekData, MonthlyStats, WorkoutStats, WorkoutSession, SheetType } from '@/types/workout';

const STORAGE_KEY = 'workout-tracker-2026';
const GOAL_KEY = 'workout-goal-2026';
const REST_DAYS_KEY = 'workout-rest-days-2026';
const SHEET_COUNT_KEY = 'workout-sheet-count-2026';

// All possible sheet types
const ALL_SHEET_TYPES: SheetType[] = ['A', 'B', 'C', 'D', 'E'];

// Workout pattern based on rest days and sheet count
const getWorkoutType = (dayOfWeek: number, restDays: number[], sheetCount: number): SheetType | 'rest' => {
  if (restDays.includes(dayOfWeek)) return 'rest';
  
  // Count non-rest days before this day in the week to determine workout type
  let workoutDayIndex = 0;
  for (let i = 0; i < dayOfWeek; i++) {
    if (!restDays.includes(i)) {
      workoutDayIndex++;
    }
  }
  
  const pattern = ALL_SHEET_TYPES.slice(0, sheetCount);
  return pattern[workoutDayIndex % sheetCount];
};

const generateYearData = (year: number, restDays: number[], sheetCount: number): WeekData[] => {
  const weeks: WeekData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Start from Jan 1st of the year
  let currentDate = new Date(year, 0, 1);
  let weekNumber = 1;
  
  
  while (currentDate.getFullYear() === year) {
    const weekDays: DayWorkout[] = [];
    const weekStartDate = new Date(currentDate);
    
    // Get the day of week for the current date (0 = Sunday, 6 = Saturday)
    const startDayOfWeek = currentDate.getDay();
    
    // Generate days until the end of this calendar week (Saturday)
    // or until we hit the end of the year
    let daysInThisWeek = 7 - startDayOfWeek; // Days remaining in this calendar week
    
    // For subsequent weeks, we always have 7 days
    if (weekNumber > 1) {
      daysInThisWeek = 7;
    }
    
    for (let i = 0; i < daysInThisWeek; i++) {
      const dayDate = new Date(currentDate);
      
      if (dayDate.getFullYear() !== year) break;
      
      const dayOfWeek = dayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      weekDays.push({
        date: dayDate.toISOString().split('T')[0],
        workoutType: getWorkoutType(dayOfWeek, restDays, sheetCount),
        completed: false,
        duration: 0,
        sessions: [],
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (weekDays.length === 0) break;
    
    const weekEnd = new Date(weekDays[weekDays.length - 1].date);
    const isCurrent = today >= weekStartDate && today <= weekEnd;
    
    weeks.push({
      weekNumber,
      startDate: weekDays[0].date,
      endDate: weekDays[weekDays.length - 1].date,
      days: weekDays,
      isCurrent,
    });
    
    weekNumber++;
    
    if (weekNumber > 54) break;
  }
  
  return weeks;
};

export const useWorkouts = () => {
  const [restDays, setRestDays] = useState<number[]>(() => {
    const saved = localStorage.getItem(REST_DAYS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [0]; // Default: Sunday
      }
    }
    return [0]; // Default: Sunday
  });

  const [sheetCount, setSheetCount] = useState<number>(() => {
    const saved = localStorage.getItem(SHEET_COUNT_KEY);
    return saved ? parseInt(saved, 10) : 3;
  });

  const [weeks, setWeeks] = useState<WeekData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedRestDays = localStorage.getItem(REST_DAYS_KEY);
    const savedSheetCount = localStorage.getItem(SHEET_COUNT_KEY);
    const currentRestDays = savedRestDays ? JSON.parse(savedRestDays) : [0];
    const currentSheetCount = savedSheetCount ? parseInt(savedSheetCount, 10) : 3;
    
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return generateYearData(2026, currentRestDays, currentSheetCount);
      }
    }
    return generateYearData(2026, currentRestDays, currentSheetCount);
  });

  const [annualGoal, setAnnualGoal] = useState<number>(() => {
    const saved = localStorage.getItem(GOAL_KEY);
    return saved ? parseInt(saved, 10) : 208;
  });

  // Initialize with today's date expanded by default
  const [expandedDay, setExpandedDay] = useState<string | null>(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
  }, [weeks]);

  useEffect(() => {
    localStorage.setItem(GOAL_KEY, annualGoal.toString());
  }, [annualGoal]);

  useEffect(() => {
    localStorage.setItem(REST_DAYS_KEY, JSON.stringify(restDays));
  }, [restDays]);

  useEffect(() => {
    localStorage.setItem(SHEET_COUNT_KEY, sheetCount.toString());
  }, [sheetCount]);

  const updateRestDays = useCallback((newRestDays: number[]) => {
    setRestDays(newRestDays);
    // Regenerate weeks with new rest days while preserving session data
    setWeeks(prevWeeks => {
      const newWeeks = generateYearData(2026, newRestDays, sheetCount);
      // Merge existing session data
      return newWeeks.map(newWeek => {
        const existingWeek = prevWeeks.find(w => w.weekNumber === newWeek.weekNumber);
        if (!existingWeek) return newWeek;
        
        return {
          ...newWeek,
          days: newWeek.days.map(newDay => {
            const existingDay = existingWeek.days.find(d => d.date === newDay.date);
            if (!existingDay) return newDay;
            
            return {
              ...newDay,
              sessions: existingDay.sessions,
              duration: existingDay.duration,
              completed: existingDay.completed,
            };
          }),
        };
      });
    });
  }, [sheetCount]);

  const updateSheetCount = useCallback((newCount: number) => {
    setSheetCount(newCount);
    // Regenerate weeks with new sheet count while preserving session data
    setWeeks(prevWeeks => {
      const newWeeks = generateYearData(2026, restDays, newCount);
      // Merge existing session data
      return newWeeks.map(newWeek => {
        const existingWeek = prevWeeks.find(w => w.weekNumber === newWeek.weekNumber);
        if (!existingWeek) return newWeek;
        
        return {
          ...newWeek,
          days: newWeek.days.map(newDay => {
            const existingDay = existingWeek.days.find(d => d.date === newDay.date);
            if (!existingDay) return newDay;
            
            return {
              ...newDay,
              sessions: existingDay.sessions,
              duration: existingDay.duration,
              completed: existingDay.completed,
            };
          }),
        };
      });
    });
  }, [restDays]);

  const updateAnnualGoal = (goal: number) => {
    setAnnualGoal(goal);
  };

  const toggleDayExpanded = (date: string) => {
    setExpandedDay(prev => prev === date ? null : date);
  };

  const addSession = useCallback((date: string, session: Omit<WorkoutSession, 'id' | 'createdAt'>) => {
    const newSession: WorkoutSession = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setWeeks(prev =>
      prev.map(week => ({
        ...week,
        days: week.days.map(day => {
          if (day.date === date) {
            const newSessions = [...day.sessions, newSession];
            const totalDuration = newSessions.reduce((sum, s) => sum + s.duration, 0);
            return {
              ...day,
              sessions: newSessions,
              duration: totalDuration,
              completed: totalDuration > 0,
            };
          }
          return day;
        }),
      }))
    );
  }, []);

  const deleteSession = useCallback((date: string, sessionId: string) => {
    setWeeks(prev =>
      prev.map(week => ({
        ...week,
        days: week.days.map(day => {
          if (day.date === date) {
            const newSessions = day.sessions.filter(s => s.id !== sessionId);
            const totalDuration = newSessions.reduce((sum, s) => sum + s.duration, 0);
            return {
              ...day,
              sessions: newSessions,
              duration: totalDuration,
              completed: totalDuration > 0,
            };
          }
          return day;
        }),
      }))
    );
  }, []);

  const toggleExerciseComplete = useCallback((date: string, exerciseId: string) => {
    setWeeks(prev =>
      prev.map(week => ({
        ...week,
        days: week.days.map(day => {
          if (day.date === date) {
            const currentCompleted = day.completedExercises || [];
            const isCompleted = currentCompleted.includes(exerciseId);
            const newCompleted = isCompleted
              ? currentCompleted.filter(id => id !== exerciseId)
              : [...currentCompleted, exerciseId];
            
            return {
              ...day,
              completedExercises: newCompleted,
            };
          }
          return day;
        }),
      }))
    );
  }, []);

  const getStats = useCallback((): WorkoutStats => {
    let completed = 0;
    let totalSeconds = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    weeks.forEach(week => {
      week.days.forEach(day => {
        if (day.completed && day.workoutType !== 'rest') {
          completed++;
        }
        totalSeconds += day.duration;
      });
    });

    const currentWeek = weeks.find(w => w.isCurrent)?.weekNumber || 1;
    const progress = annualGoal > 0 ? (completed / annualGoal) * 100 : 0;
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

    return {
      completed,
      progress,
      totalHours,
      totalMinutes,
      currentWeek,
      annualGoal,
      remaining: Math.max(0, annualGoal - completed),
    };
  }, [weeks, annualGoal]);

  const getMonthlyStats = useCallback((): MonthlyStats[] => {
    const months: MonthlyStats[] = [
      { month: 0, name: 'Jan', completed: 0, percentage: 0 },
      { month: 1, name: 'Fev', completed: 0, percentage: 0 },
      { month: 2, name: 'Mar', completed: 0, percentage: 0 },
      { month: 3, name: 'Abr', completed: 0, percentage: 0 },
      { month: 4, name: 'Mai', completed: 0, percentage: 0 },
      { month: 5, name: 'Jun', completed: 0, percentage: 0 },
      { month: 6, name: 'Jul', completed: 0, percentage: 0 },
      { month: 7, name: 'Ago', completed: 0, percentage: 0 },
      { month: 8, name: 'Set', completed: 0, percentage: 0 },
      { month: 9, name: 'Out', completed: 0, percentage: 0 },
      { month: 10, name: 'Nov', completed: 0, percentage: 0 },
      { month: 11, name: 'Dez', completed: 0, percentage: 0 },
    ];

    // Count workouts per month
    const workoutsPerMonth: number[] = new Array(12).fill(0);
    const completedPerMonth: number[] = new Array(12).fill(0);

    weeks.forEach(week => {
      week.days.forEach(day => {
        const date = new Date(day.date);
        const month = date.getMonth();
        if (day.workoutType !== 'rest') {
          workoutsPerMonth[month]++;
          if (day.completed) {
            completedPerMonth[month]++;
          }
        }
      });
    });

    months.forEach((m, i) => {
      m.completed = completedPerMonth[i];
      m.percentage = workoutsPerMonth[i] > 0 
        ? Math.round((completedPerMonth[i] / workoutsPerMonth[i]) * 100) 
        : 0;
    });

    return months;
  }, [weeks]);

  const getDayData = useCallback((date: string): DayWorkout | undefined => {
    for (const week of weeks) {
      const day = week.days.find(d => d.date === date);
      if (day) return day;
    }
    return undefined;
  }, [weeks]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatTimeDetailed = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Dynamically calculate which week is current based on today's date
  const weeksWithCurrentFlag = weeks.map(week => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(week.startDate + 'T00:00:00');
    const weekEnd = new Date(week.endDate + 'T23:59:59');
    return {
      ...week,
      isCurrent: today >= weekStart && today <= weekEnd,
    };
  });

  return {
    weeks: weeksWithCurrentFlag,
    restDays,
    sheetCount,
    annualGoal,
    expandedDay,
    updateRestDays,
    updateSheetCount,
    updateAnnualGoal,
    toggleDayExpanded,
    addSession,
    deleteSession,
    toggleExerciseComplete,
    getStats,
    getMonthlyStats,
    getDayData,
    formatTime,
    formatTimeDetailed,
  };
};
