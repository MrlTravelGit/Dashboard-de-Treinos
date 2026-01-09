import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  DayWorkout,
  WeekData,
  WorkoutSession,
  WorkoutStats,
  MonthlyStats,
  SheetType,
} from "@/types/workout";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

const ALL_SHEET_TYPES: SheetType[] = ["A", "B", "C", "D", "E"];

const todayISO = () => new Date().toISOString().split("T")[0];

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

const getWorkoutType = (
  dayOfWeek: number,
  restDays: number[],
  sheetCount: number
): SheetType | "rest" => {
  if (restDays.includes(dayOfWeek)) return "rest";

  // Conta quantos dias úteis já passaram na semana
  let workoutDayIndex = 0;
  for (let i = 0; i < dayOfWeek; i++) {
    if (!restDays.includes(i)) workoutDayIndex++;
  }

  const pattern = ALL_SHEET_TYPES.slice(0, sheetCount);
  return pattern[workoutDayIndex % pattern.length];
};

const generateYearData = (
  year: number,
  restDays: number[],
  sheetCount: number
): WeekData[] => {
  const weeks: WeekData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(year, 0, 1);
  let weekNumber = 1;

  // Gera semanas até sair do ano
  while (currentDate.getFullYear() === year) {
    const weekDays: DayWorkout[] = [];
    const weekStartDate = new Date(currentDate);

    const startDayOfWeek = currentDate.getDay();
    let daysInThisWeek = 7 - startDayOfWeek;
    if (weekNumber > 1) daysInThisWeek = 7;

    for (let i = 0; i < daysInThisWeek; i++) {
      const dayDate = new Date(currentDate);
      if (dayDate.getFullYear() !== year) break;

      const dow = dayDate.getDay();
      weekDays.push({
        date: dayDate.toISOString().split("T")[0],
        workoutType: getWorkoutType(dow, restDays, sheetCount),
        completed: false,
        duration: 0,
        sessions: [],
        completedExercises: [],
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (weekDays.length === 0) break;

    const weekEndDate = new Date(weekDays[weekDays.length - 1].date);
    const isCurrent = today >= weekStartDate && today <= weekEndDate;

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

type DbUserWorkouts = {
  user_id: string;
  year?: number;
  weeks?: WeekData[];
};

type DbUserSettings = {
  user_id: string;
  rest_days?: number[];
  sheet_count?: number;
  annual_goal?: number;
};

export const useWorkouts = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(todayISO());
  const [restDays, setRestDays] = useState<number[]>([0]);
  const [sheetCount, setSheetCount] = useState(3);
  const [annualGoal, setAnnualGoal] = useState(208);

  const year = useMemo(() => new Date().getFullYear(), []);

  // Evita sobrescrever estado se houver múltiplos triggers
  const hydratedRef = useRef(false);
  // Debounce de salvamento
  const saveTimerRef = useRef<number | null>(null);
  const settingsTimerRef = useRef<number | null>(null);
  const lastSavedHashRef = useRef<string>("");

  const safeSupabase = isSupabaseConfigured && supabase ? supabase : null;

  const persistWeeks = useCallback(
    async (uid: string, value: WeekData[]) => {
      if (!safeSupabase) return;

      const payload = {
        user_id: uid,
        year,
        weeks: value,
      };

      const { error } = await safeSupabase.from("user_workouts").upsert(payload);
      if (error) console.error("Erro ao salvar user_workouts:", error);
    },
    [safeSupabase, year]
  );

  const persistSettings = useCallback(
    async (uid: string, nextRestDays: number[], nextSheetCount: number, nextGoal: number) => {
      if (!safeSupabase) return;

      // Se a tabela user_settings não existir, o Supabase retorna erro.
      // Nesse caso, apenas logamos e seguimos, para não derrubar a UI.
      const { error } = await safeSupabase
        .from("user_settings")
        .upsert({
          user_id: uid,
          rest_days: nextRestDays,
          sheet_count: nextSheetCount,
          annual_goal: nextGoal,
        });

      if (error) console.error("Erro ao salvar user_settings:", error);
    },
    [safeSupabase]
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!safeSupabase) {
        console.error(
          "Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel."
        );
        if (mounted) setLoading(false);
        return;
      }

      const { data, error } = await safeSupabase.auth.getUser();
      if (error) console.error("Erro auth.getUser:", error);
      const uid = data.user?.id ?? null;

      if (!mounted) return;

      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }

      if (hydratedRef.current) {
        setLoading(false);
        return;
      }
      hydratedRef.current = true;

      setLoading(true);

      // 1) Carrega settings (se existir tabela)
      // Usamos variáveis locais para gerar o ano com os valores carregados, evitando inconsistência de closure.
      let effectiveRestDays = restDays;
      let effectiveSheetCount = sheetCount;
      let effectiveAnnualGoal = annualGoal;

      try {
        const { data: settings, error: settingsError } = await safeSupabase
          .from("user_settings")
          .select("*")
          .eq("user_id", uid)
          .maybeSingle<DbUserSettings>();

        if (settingsError) {
          console.error("Erro ao carregar user_settings:", settingsError);
        } else if (settings) {
          effectiveRestDays = settings.rest_days ?? [0];
          effectiveSheetCount = settings.sheet_count ?? 3;
          effectiveAnnualGoal = settings.annual_goal ?? 208;

          setRestDays(effectiveRestDays);
          setSheetCount(effectiveSheetCount);
          setAnnualGoal(effectiveAnnualGoal);
        }
      } catch (e) {
        // tabela pode não existir
        console.error("Falha ao acessar user_settings:", e);
      }

      // 2) Carrega weeks
      const { data: workouts, error: workoutsError } = await safeSupabase
        .from("user_workouts")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle<DbUserWorkouts>();

      if (workoutsError) console.error("Erro ao carregar user_workouts:", workoutsError);

      const storedYear = workouts?.year;
      const storedWeeks = workouts?.weeks;

      // Se não existir nada, ou ano for diferente, gera do zero para o ano atual
      const shouldGenerate =
        !Array.isArray(storedWeeks) || storedWeeks.length === 0 || storedYear !== year;

      if (shouldGenerate) {
        const initial = generateYearData(year, effectiveRestDays, effectiveSheetCount);
        setWeeks(initial);
        await persistWeeks(uid, initial);
        // também persiste o settings atual (melhor esforço)
        await persistSettings(uid, effectiveRestDays, effectiveSheetCount, effectiveAnnualGoal);
      } else {
        setWeeks(storedWeeks);
      }

      if (mounted) setLoading(false);
    };

    init();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salva weeks com debounce sempre que mudar
  useEffect(() => {
    if (!userId) return;
    if (!safeSupabase) return;
    if (loading) return;

    // hash simples para evitar salvar em loop
    const hash = JSON.stringify({ year, weeks });
    if (hash === lastSavedHashRef.current) return;

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);

    saveTimerRef.current = window.setTimeout(async () => {
      lastSavedHashRef.current = hash;
      await persistWeeks(userId, weeks);
    }, 600);
  }, [weeks, userId, safeSupabase, loading, persistWeeks, year]);

  // Salva settings com debounce
  useEffect(() => {
    if (!userId) return;
    if (!safeSupabase) return;
    if (loading) return;

    if (settingsTimerRef.current) window.clearTimeout(settingsTimerRef.current);

    settingsTimerRef.current = window.setTimeout(async () => {
      await persistSettings(userId, restDays, sheetCount, annualGoal);
    }, 600);
  }, [restDays, sheetCount, annualGoal, userId, safeSupabase, loading, persistSettings]);

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

  const updateRestDays = (days: number[]) => {
    if (loading) return;
    setRestDays(days);
    // Atualiza a estrutura do ano atual respeitando dias de descanso
    setWeeks((prev) => {
      if (!prev.length) return prev;
      return prev.map((w) => ({
        ...w,
        days: w.days.map((d) => {
          const dt = new Date(d.date);
          const dow = dt.getDay();
          const nextType = getWorkoutType(dow, days, sheetCount);
          return { ...d, workoutType: nextType };
        }),
      }));
    });
  };

  const updateSheetCount = (count: number) => {
    if (loading) return;
    const nextCount = Math.max(1, Math.min(ALL_SHEET_TYPES.length, count));
    setSheetCount(nextCount);
    setWeeks((prev) => {
      if (!prev.length) return prev;
      return prev.map((w) => ({
        ...w,
        days: w.days.map((d) => {
          const dt = new Date(d.date);
          const dow = dt.getDay();
          const nextType = getWorkoutType(dow, restDays, nextCount);
          return { ...d, workoutType: nextType };
        }),
      }));
    });
  };

  const updateAnnualGoal = (goal: number) => {
    if (loading) return;
    const next = Math.max(1, Math.floor(goal));
    setAnnualGoal(next);
  };

  const addSession = (date: string, duration: number, isManual: boolean, justification?: string) => {
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
    if (loading) return;
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
    if (loading) return;
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

  const getMonthlyStats = (): MonthlyStats[] => {
    // Evita quebrar se weeks estiver vazio
    const map = new Map<number, { completed: number }>();

    weeks.forEach((w) =>
      w.days.forEach((d) => {
        const dt = new Date(d.date);
        const month = dt.getMonth();
        const prev = map.get(month) ?? { completed: 0 };
        const completed = prev.completed + (d.completed && d.workoutType !== "rest" ? 1 : 0);
        map.set(month, { completed });
      })
    );

    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const targetPerMonth = annualGoal > 0 ? annualGoal / 12 : 0;

    return Array.from({ length: 12 }).map((_, month) => {
      const v = map.get(month) ?? { completed: 0 };
      const pct = targetPerMonth > 0 ? Math.round((v.completed / targetPerMonth) * 100) : 0;
      return {
        month,
        name: monthNames[month],
        completed: v.completed,
        percentage: Math.max(0, pct),
      };
    });
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
    updateRestDays,
    updateSheetCount,
    updateAnnualGoal,
    addSession,
    deleteSession,
    toggleExerciseComplete,
    getStats,
    getMonthlyStats,
    formatTime,
    formatTimeDetailed,
  };
};
