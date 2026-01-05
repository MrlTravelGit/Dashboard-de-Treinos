import { useEffect, useState } from "react";
import { WorkoutSheet, SheetType } from "@/types/workout";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_SHEETS: SheetType[] = ["A", "B", "C", "D", "E"];

export function useWorkoutSheets() {
  const { user } = useAuth();
  const [sheets, setSheets] = useState<WorkoutSheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadSheets = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("workout_sheets")
        .select("*")
        .eq("user_id", user.id)
        .order("type");

      if (error) {
        console.error("Erro ao carregar fichas", error);
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        const initialSheets = DEFAULT_SHEETS.map((type) => ({
          user_id: user.id,
          type,
          name: `Treino ${type}`,
          exercises: [],
        }));

        const { data: inserted } = await supabase
          .from("workout_sheets")
          .insert(initialSheets)
          .select();

        setSheets(inserted ?? []);
      } else {
        setSheets(
          data.map((s) => ({
            type: s.type,
            name: s.name,
            exercises: s.exercises ?? [],
          }))
        );
      }

      setLoading(false);
    };

    loadSheets();
  }, [user]);

  const updateSheet = async (sheet: WorkoutSheet) => {
    if (!user) return;

    setSheets((prev) =>
      prev.map((s) => (s.type === sheet.type ? sheet : s))
    );

    await supabase
      .from("workout_sheets")
      .update({
        name: sheet.name,
        exercises: sheet.exercises,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("type", sheet.type);
  };

  const getSheetByType = (type: SheetType) =>
    sheets.find((s) => s.type === type);

  return {
    sheets,
    loading,
    updateSheet,
    getSheetByType,
  };
}
