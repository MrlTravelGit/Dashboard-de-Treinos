import { useEffect, useState } from "react";
import type { WorkoutSheet, SheetType } from "@/types/workout";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_SHEETS: SheetType[] = ["A", "B", "C", "D", "E"];

/**
 * Carrega, cria (se necessário) e salva as fichas de treino do usuário no Supabase.
 * 
 * Observação: se o Supabase não estiver configurado, o hook não quebra a UI.
 */
export function useWorkoutSheets() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [sheets, setSheets] = useState<WorkoutSheet[]>([]);
  const [expandedSheet, setExpandedSheet] = useState<SheetType | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      // Sem usuário: não há o que carregar.
      if (!user) {
        if (mounted) {
          setSheets([]);
          setExpandedSheet(null);
          setLoading(false);
        }
        return;
      }

      // Sem Supabase configurado: não quebra, apenas libera a UI.
      if (!isSupabaseConfigured || !supabase) {
        if (mounted) setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("workout_sheets")
        .select("*")
        .eq("user_id", user.id)
        .order("type");

      if (!mounted) return;

      if (error) {
        console.error("Erro ao carregar workout_sheets:", error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setSheets(
          data.map((s: any) => ({
            type: s.type,
            name: s.name,
            exercises: s.exercises ?? [],
          }))
        );
        setLoading(false);
        return;
      }

      // Não existe nada ainda: cria padrão A-E
      const initial = DEFAULT_SHEETS.map((type) => ({
        user_id: user.id,
        type,
        name: `Treino ${type}`,
        exercises: [],
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("workout_sheets")
        .insert(initial)
        .select();

      if (!mounted) return;

      if (insertError) {
        console.error("Erro ao criar workout_sheets:", insertError);
        setLoading(false);
        return;
      }

      setSheets(
        (inserted ?? []).map((s: any) => ({
          type: s.type,
          name: s.name,
          exercises: s.exercises ?? [],
        }))
      );
      setLoading(false);
    };

    run();

    return () => {
      mounted = false;
    };
  }, [user]);

  const updateSheet = async (sheet: WorkoutSheet) => {
    if (!user) return;

    setSheets((prev) => prev.map((s) => (s.type === sheet.type ? sheet : s)));

    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase
      .from("workout_sheets")
      .update({
        name: sheet.name,
        exercises: sheet.exercises,
      })
      .eq("user_id", user.id)
      .eq("type", sheet.type);

    if (error) console.error("Erro ao salvar workout_sheets:", error);
  };

  const onExpandSheet = (type: SheetType) => {
    setExpandedSheet((prev) => (prev === type ? null : type));
  };

  const getSheetByType = (type: SheetType) => sheets.find((s) => s.type === type);

  return {
    loading,
    sheets,
    expandedSheet,
    updateSheet,
    onExpandSheet,
    getSheetByType,
  };
}
